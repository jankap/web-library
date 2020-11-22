'use strict';

import React from 'react';
import { connect } from 'react-redux';

import Notes from '../../component/item-details/notes';
import { deleteItem, createItem, updateItem, sourceFile, fetchChildItems, fetchItemTemplate,
	moveToTrash, navigate } from '../../actions';
import { get } from '../../utils';

const NotesContainer = props => <Notes { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey, noteKey } = state.current;
	const childItemsData = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], {});
	const { isFetching, pointer, keys, totalResults } = childItemsData;
	const childItems = (keys || []).map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const uploads = get(state, ['libraries', libraryKey, 'updating', 'uploads'], []);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const isTinymceFetched = state.sources.fetched.includes('tinymce');
	const isTinymceFetching = state.sources.fetching.includes('tinymce');
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems && isTinymceFetched;

	return { childItems, libraryKey, itemKey, noteKey, isFetched, isFetching,
		isTinymceFetched, isTinymceFetching, uploads, pointer, totalResults };
}

export default connect(
	mapStateToProps, { deleteItem, createItem, updateItem, fetchChildItems, fetchItemTemplate, moveToTrash, navigate, sourceFile }
)(NotesContainer)
