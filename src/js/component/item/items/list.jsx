import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';

import ListRow from './list-row';
import Spinner from '../../ui/spinner';
import { abortAllRequests, connectionIssues, fetchSource } from '../../../actions';
import { usePrevious, useSourceData } from '../../../hooks';
import { get, getRequestTypeFromItemsSource } from '../../../utils';

const ROWHEIGHT = 61;

const ItemsList = memo(props => {
	const { isSearchModeTransitioning } = props;
	const loader = useRef(null);
	const listRef = useRef(null);
	const lastRequest = useRef({});
	const dispatch = useDispatch();
	const { hasChecked, isFetching, keys, requests, totalResults } = useSourceData();
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const columnsData = useSelector(state => state.preferences.columns, shallowEqual);
	const isSearchModeTransitioningOut = !isSearchMode && isSearchModeTransitioning;
	const requestType = getRequestTypeFromItemsSource(itemsSource);
	const errorCount = useSelector(state => get(state, ['traffic', requestType, 'errorCount'], 0));
	const prevErrorCount = usePrevious(errorCount);

	//@NOTE: On mobiles (single-column) we have a dedicated search mode where. To prevent visual glitches
	//		 where current items overlap empty search prompt we need the following hack. See #230
	const isSearchModeHack = isSingleColumn && (isSearchMode || isSearchModeTransitioningOut) &&
		itemsSource !== 'query' && view !== 'item-list';

	const { field: sortBy, sort: sortDirection } = useMemo(() =>
		columnsData.find(column => 'sort' in column) || { field: 'title', sort: 'asc' },
		[columnsData]
	);
	const prevSortBy = usePrevious(sortBy);
	const prevSortDirection = usePrevious(sortDirection);

	const selectedItemKeys = useSelector(state => state.current.itemKeys, shallowEqual);

	const handleIsItemLoaded = useCallback(index => {
		if(keys && !!keys[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	}, [keys, requests]);

	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		dispatch(fetchSource(startIndex, stopIndex))
		lastRequest.current = { startIndex, stopIndex };
	}, [dispatch]);

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchSource(0, 50));
			lastRequest.current = { startIndex: 0, stopIndex: 50 };
		}
	}, [dispatch, isFetching, hasChecked]);

	useEffect(() => {
		if(errorCount > 0 && errorCount > prevErrorCount) {
			const { startIndex, stopIndex } = lastRequest.current;
			if(typeof(startIndex) === 'number' && typeof(stopIndex) === 'number') {
				dispatch(fetchSource(startIndex, stopIndex));
			}
		}
		if(errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if(errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [dispatch, errorCount, prevErrorCount]);

	useEffect(() => {
		if(prevSortBy === sortBy && prevSortDirection === sortDirection) {
			return;
		}

		if(loader.current) {
			loader.current.resetloadMoreItemsCache(true);
		}

		if(isFetching) {
			dispatch(abortAllRequests(requestType));
			setTimeout(() => {
				const { startIndex, stopIndex } = lastRequest.current;
				if(typeof(startIndex) === 'number' && typeof(stopIndex) === 'number') {
					dispatch(fetchSource(startIndex, stopIndex));
				}
			}, 0)
		}
	}, [dispatch, isFetching, prevSortBy, prevSortDirection, requestType, sortBy, sortDirection, totalResults]);

	useEffect(() => {
		if(listRef.current && selectedItemKeys.length && keys) {
			const itemKey = selectedItemKeys[selectedItemKeys.length - 1];
			const itemKeyIndex = keys.findIndex(k => k === itemKey);
			listRef.current.scrollToItem(itemKeyIndex);
		}
	}, [keys, selectedItemKeys]);

	return (
		<div className="items-list-wrap">
			<AutoSizer>
			{({ height, width }) => (
				<InfiniteLoader
					ref={ loader }
					listRef={ listRef }
					isItemLoaded={ handleIsItemLoaded }
					itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
					loadMoreItems={ handleLoadMore }
				>
					{({ onItemsRendered, ref }) => (
						<List
							className={ cx('items-list', {
								'editing': isSelectMode,
							}) }
							height={ height }
							itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
							itemData={ { keys } }
							itemSize={ ROWHEIGHT }
							onItemsRendered={ onItemsRendered }
							ref={ r => { ref(r); listRef.current = r; } }
							width={ width }
						>
							{ ListRow }
						</List>
					)}
				</InfiniteLoader>
			)}
			</AutoSizer>
			{ !hasChecked && !isSearchModeHack && <Spinner className="large" /> }
			{ hasChecked && totalResults === 0 && (
				<div className="item-list-empty">
					No items in this view
				</div>
			) }
		</div>
	);
});

ItemsList.displayName = 'ItemsList';

ItemsList.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default memo(ItemsList);
