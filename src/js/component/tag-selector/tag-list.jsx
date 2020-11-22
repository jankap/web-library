import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { connectionIssues, checkColoredTags, fetchTags, navigate } from '../../actions';
import { isTriggerEvent } from '../../common/event';
import { useFocusManager, useSourceSignature, usePrevious, useTags } from '../../hooks';
import { get } from '../../utils';

const PAGE_SIZE = 100;

const TagList = () => {
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const tagColors = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'tagColors']), shallowEqual);
	const prevTagColors = usePrevious(tagColors);
	const dispatch = useDispatch();
	const tagContainerRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev } = useFocusManager(tagContainerRef, null, false);
	const containerRef = useRef(null);
	const listRef = useRef(null);
	const { isFetching, isFetchingColoredTags, pointer, tags, totalResults, hasChecked,
	hasCheckedColoredTags } = useTags();
	const sourceSignature = useSourceSignature();
	const errorCount = useSelector(state => {
		switch(state.current.itemsSource) {
			case 'query': return get(state, ['traffic', 'TAGS_IN_ITEMS_BY_QUERY', 'errorCount'], 0);
			case 'trash': return get(state, ['traffic', 'TAGS_IN_TRASH_ITEMS', 'errorCount'], 0);
			case 'publications': return get(state, ['traffic', 'TAGS_IN_PUBLICATIONS_ITEMS', 'errorCount'], 0);
			case 'collection': return get(state, ['traffic', 'TAGS_IN_COLLECTION', 'errorCount'], 0);
			case 'top': return get(state, ['traffic', 'TAGS_IN_TOP_ITEMS', 'errorCount'], 0);
		}
	});
	const prevErrorCount = usePrevious(errorCount);

	const maybeLoadMore = useCallback(() => {
		const containerHeight = containerRef.current.getBoundingClientRect().height;
		const totalHeight = listRef.current.getBoundingClientRect().height;
		const scrollProgress = (containerRef.current.scrollTop + containerHeight) / totalHeight;

		if(pointer && scrollProgress > 0.5 && !isFetching && ((totalResults > pointer) || (totalResults === null))) {
			dispatch(fetchTags(pointer, pointer + PAGE_SIZE - 1));
		}
	}, [dispatch, isFetching, pointer, totalResults]);

	const toggleTag = useCallback(tagName => {
		const index = selectedTags.indexOf(tagName);
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		dispatch(navigate({ tags: selectedTags, items: null }));
	}, [dispatch, selectedTags]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
			focusNext(ev);
		} else if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
			focusPrev(ev);
		} else if(isTriggerEvent(ev)) {
			handleClick(ev);
		}
	}, [focusNext, focusPrev, handleClick]);

	const handleClick = useCallback(ev => {
		const tag = ev.currentTarget.dataset.tag;
		// @NOTE: the <li> element in this event will be removed while new tags are fetched as a
		// result of toggleTag(). Need to trigger blur() so that container can accept focus again.
		// See #372
		ev.currentTarget.blur();
		toggleTag(tag);
	}, [toggleTag]);

	useEffect(() => {
		if(totalResults === null) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
		}
	}, [dispatch, totalResults]);

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
		}
	}, [dispatch, sourceSignature, hasChecked, isFetching]);

	useEffect(() => {
		if(!isFetchingColoredTags && typeof(prevTagColors) !== 'undefined' && !shallowEqual(tagColors, prevTagColors)) {
			dispatch(checkColoredTags());
		} else if(!hasCheckedColoredTags && !isFetchingColoredTags && Object.keys(tagColors).length) {
			dispatch(checkColoredTags());
		}
	}, [dispatch, sourceSignature, prevTagColors, tagColors, hasCheckedColoredTags, isFetchingColoredTags]);

	useEffect(() => {
		setTimeout(maybeLoadMore, 0);
	}, [maybeLoadMore, tagsSearchString, pointer]);

	useEffect(() => {
		if(errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if(errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [dispatch, errorCount, prevErrorCount]);

	return (
		<div
			className="scroll-container"
			onScroll={ maybeLoadMore }
			ref={ containerRef }
		>
			<div
				className="tag-selector-container"
				onBlur={ receiveBlur }
				onFocus={ receiveFocus }
				ref={ tagContainerRef }
				tabIndex={ 0 }
				aria-label="tag selector"
			>
				<ul
					ref={ listRef }
					className="tag-selector-list"
				>
					{ tags.filter(t => !!t).map(tag => (
						<li
							className={ cx('tag', {
								disabled: tag.disabled,
								selected: tag.selected,
								colored: tag.color,
								placeholder: tag.isPlaceholder
							}) }
							data-tag={ tag.tag }
							key={ tag.tag }
							onClick={ handleClick }
							onKeyDown={ handleKeyDown }
							role="button"
							style={ tag.color && { color: tag.color} }
							tabIndex={ tag.disabled ? null : -2 }
						>
							<span className="tag-label">{ tag.tag }</span>
						</li>
					)) }
				</ul>
			</div>
		</div>
	);
}

export default memo(TagList);
