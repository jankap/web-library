'use strict';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import ItemBox from './box';
import Abstract from './abstract';
import { getBaseMappedValue } from '../../common/item';
import { TabPane } from '../ui/tabs';
import withEditMode from '../../enhancers/with-edit-mode.js';

const Info = props => {
	const { fetchItemTypeCreatorTypes, fetchItemTypeFields, isActive, isEditing, isLibraryReadOnly,
		isLoadingMeta, item, shouldFetchMeta } = props;
	const title = getBaseMappedValue(item, 'title') || '';

	useEffect(() => {
		if(shouldFetchMeta) {
			fetchItemTypeCreatorTypes(item.itemType);
			fetchItemTypeFields(item.itemType);
		}
	}, [shouldFetchMeta]);

	return (
		<TabPane
			className="info"
			isActive={ isActive }
			isLoading={ isLoadingMeta }
		>
			<div className="scroll-container-mouse">
				<div className="row">
					<div className="col">
						{ !isEditing && (
								<h5 className={ cx(
									'h1','item-title', {
										placeholder: title.length === 0
									}
								)}>
									{ title.length === 0 ? 'Untitled' : title }
								</h5>
							)
						}
						<ItemBox
							{ ...props }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					{ (!isLibraryReadOnly || item.abstractNote) && (
						<div className="col">
							<section className={ cx({
								'empty-abstract': !item.abstractNote,
								abstract: true,
								editing: isEditing,
							}) }>
								<h6 className="h2 abstract-heading">
									Abstract
								</h6>
								<div className="abstract-body">
									<Abstract { ...props } />
								</div>
							</section>
						</div>
					) }
				</div>
			</div>
		</TabPane>
	);
}

Info.propTypes = {
	isActive: PropTypes.bool,
	isEditing: PropTypes.bool,
	isLoadingMeta: PropTypes.bool,
	item: PropTypes.object,
}


export default withEditMode(Info);

