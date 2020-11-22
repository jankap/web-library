import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useImperativeHandle, useMemo, useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from '../ui/button';
import Editable from '../editable';
import Field from './field';
import Icon from '../ui/icon';
import Input from './input';
import Modal from '../ui/modal';
import SelectInput from './select';
import { creator as formatCreator } from '../../common/format';
import { isTriggerEvent } from '../../common/event';
import { pick } from '../../common/immutable';
import { SelectDivider, SelectOption } from '../ui/select';
import { useEditMode } from '../../hooks';

const CreatorTypeSelector = memo(forwardRef((props, ref) => {
	const { creatorsCount, index, isActive, isDisabled, onCancel, onClick, onCommit, onFocus,
	onReorder, options, value, ...rest } = props;

	const isFirst = index === 0;
	const isLast = index === creatorsCount - 1;

	const handleMoveTop = useCallback(ev => {
		if(ev.type === 'mousedown' || isTriggerEvent(ev)) {
			onReorder(index, 0, true);
			ev.stopPropagation();
		}
	}, [index, onReorder]);

	const handleMoveUp = useCallback(ev => {
		if(ev.type === 'mousedown' || isTriggerEvent(ev)) {
			onReorder(index, index -1, true);
			ev.stopPropagation();
		}
	}, [index, onReorder]);

	const handleMoveDown = useCallback(ev => {
		if(ev.type === 'mousedown' || isTriggerEvent(ev)) {
			onReorder(index, index +1, true);
			ev.stopPropagation();
		}
	}, [index, onReorder]);

	return (
		<SelectInput
			className="form-control form-control-sm"
			isActive={ isActive }
			onCancel={ onCancel }
			onChange={ () => true }
			onCommit={ onCommit }
			onClick={ onClick }
			onFocus={ onFocus }
			options={ options }
			ref={ ref }
			isDisabled = { isDisabled }
			value={ value }
			{ ... pick(rest, p => p.startsWith('data-')) }
		>
			{ creatorsCount > 1 && (
				<React.Fragment>
					<SelectDivider />
					{ (index > 1) && (
						<SelectOption
						onTrigger={ handleMoveTop }
						option={ { label: 'Move to Top', value: '_top' } }
					/> ) }
					{ !isFirst && (
						<SelectOption
						onTrigger={ handleMoveUp }
						option={ { label: 'Move Up', value: '_up' } }
					/> ) }
					{ !isLast && (
						<SelectOption
						onTrigger={ handleMoveDown }
						option={ { label: 'Move Down', value: '_down' } }
					/> ) }
				</React.Fragment>
			) }
		</SelectInput>
	);
}));

CreatorTypeSelector.displayName = 'CreatorTypeSelector';

CreatorTypeSelector.propTypes = {
	creatorsCount: PropTypes.number,
	index: PropTypes.number,
	isActive: PropTypes.bool,
	isDisabled: PropTypes.bool,
	onCancel: PropTypes.func,
	onClick: PropTypes.func,
	onCommit: PropTypes.func,
	onFocus: PropTypes.func,
	onReorder: PropTypes.func,
	options: PropTypes.array,
	value: PropTypes.string,
};

const CreatorFieldModal = memo(props => {
	const { active, creator, creatorLabel, creatorsCount, creatorTypes, index, isDual, isForm,
	isModalVisible, isReadOnly, onCancel, onClose, onCreatorRemove, onCreatorTypeSwitch,
	onEditableCommit, onFieldClick, onFieldFocus, onReorder, } = props;

	const inputProps = { active, isForm, isReadOnly, creator, label: creatorLabel, name, onFieldClick,
	onFieldFocus, onCancel, onEditableCommit };

	return (
		<Modal
			isOpen={ isModalVisible }
			contentLabel="Edit Creator"
			className="modal-touch modal-centered modal-form"
			overlayClassName={ "modal-slide" }
			closeTimeoutMS={ 600 }
			onRequestClose={ onClose }
		>
		<div className="modal-content" tabIndex={ -1 }>
			<div className="modal-header">
				<div className="modal-header-left" />
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						{ creatorLabel }
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						className="btn-link"
						onClick={ onClose }
					>
						Done
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<ol className="metadata-list editing">
					<Field className="touch-separated">
						<label>
							Creator
						</label>
						<CreatorTypeSelector
							data-field-name="creatorType"
							className="form-control form-control-sm"
							index={ index }
							inputComponent={ SelectInput }
							isActive={ active === 'creatorType' }
							isDisabled = { isReadOnly }
							onCancel={ onCancel }
							onClick={ onFieldClick }
							onCommit={ onEditableCommit }
							onFocus={ onFieldFocus }
							onReorder={ onReorder }
							options={ creatorTypes }
							value={ creator.creatorType }
							creatorsCount = { creatorsCount }
						/>
					</Field>
					{
						isDual ? (
							<React.Fragment>
								<Field>
									<label>
										Last Name
									</label>
									<CreatorFieldInputWrap { ...inputProps } name="lastName" label="last name" inModal />
								</Field>
								<Field>
									<label>
										First Name
									</label>
									<CreatorFieldInputWrap { ...inputProps } name="firstName" label="first name" inModal />
								</Field>
							</React.Fragment>
						) : (
							<Field>
								<label>
									Name
								</label>
								<CreatorFieldInputWrap { ...inputProps } name="name" label="name" inModal />
							</Field>
						)
					}
					<li className="metadata touch-separated has-btn">
						<Button onClick={ onCreatorTypeSwitch }>
							Switch to { isDual ? 'Single' : 'Dual' } Field
						</Button>
					</li>
					<li className="metadata has-btn">
						<Button
							className="btn-delete"
							onClick={ onCreatorRemove }
						>
							Delete { creatorLabel }
						</Button>
					</li>
				</ol>
			</div>
		</div>

		</Modal>
	);
});

CreatorFieldModal.displayName = 'CreatorFieldModal';
CreatorFieldModal.propTypes = {
	active: PropTypes.string,
	creator: PropTypes.object,
	creatorLabel: PropTypes.string,
	creatorsCount: PropTypes.number,
	creatorTypes: PropTypes.array,
	index: PropTypes.number,
	isDual: PropTypes.bool,
	isForm: PropTypes.bool,
	isModalVisible: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	onCancel: PropTypes.func,
	onClose: PropTypes.func,
	onCreatorRemove: PropTypes.func,
	onCreatorTypeSwitch: PropTypes.func,
	onEditableCommit: PropTypes.func,
	onFieldClick: PropTypes.func,
	onFieldFocus: PropTypes.func,
	onReorder: PropTypes.func,
};


// const CreatorFieldInput = memo(forwardRef((props, ref) => {
// 	const { isForm, isReadOnly, creator, onFieldClick, onFieldFocus, onCancel, onEditableCommit, label, inModal,
// 	name, } = props;
// 	const shouldUseEditable = !isForm && !inModal;


// }));

// CreatorFieldInput.displayName = 'CreatorFieldInput';
// CreatorFieldInput.propTypes = {
// 	creator: PropTypes.object,
// 	inModal: PropTypes.bool,
// 	isForm: PropTypes.bool,
// 	isReadOnly: PropTypes.bool,
// 	label: PropTypes.string,
// 	name: PropTypes.string,
// 	onCancel: PropTypes.func,
// 	onEditableCommit: PropTypes.func,
// 	onFieldClick: PropTypes.func,
// 	onFieldFocus: PropTypes.func,
// };

const CreatorFieldInputWrap = memo(forwardRef((props, ref) => {
	const { active, creator, inModal, isForm, isReadOnly, label, name, onCancel, onEditableCommit,
	onFieldClick, onFieldFocus, } = props;
	const shouldUseEditable = !isForm && !inModal;

	const formField = <Input
		aria-label={ label }
		autoFocus={ shouldUseEditable }
		className={ shouldUseEditable ? 'editable-control' : 'form-control form-control-sm' }
		data-field-name={ name }
		isDisabled={ isReadOnly }
		onCancel={ onCancel }
		onClick={ onFieldClick }
		onCommit={ onEditableCommit }
		onFocus={ onFieldFocus }
		placeholder={ label }
		ref={ ref }
		resize={ (!inModal && name === 'lastName') ? 'horizontal' : null }
		selectOnFocus={ shouldUseEditable }
		tabIndex={ 0 }
		value={ creator[name] }
	/>;

	return shouldUseEditable ?
		<Editable
			data-field-name={ name }
			input={ formField }
			isActive={ active === name }
			isDisabled={ isReadOnly }
			onClick={ onFieldClick }
			onFocus={ onFieldFocus }
		/> :
		formField;
}));

CreatorFieldInputWrap.displayName = 'CreatorFieldInputWrap';
CreatorFieldInputWrap.propTypes = {
	active: PropTypes.string,
	creator: PropTypes.object,
	inModal: PropTypes.bool,
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	label: PropTypes.string,
	name: PropTypes.string,
	onCancel: PropTypes.func,
	onEditableCommit: PropTypes.func,
	onFieldClick: PropTypes.func,
	onFieldFocus: PropTypes.func,
};

const CreatorField = forwardRef((props, ref) => {
	const { className, creator, creatorsCount, creatorTypes, index, isCreateAllowed,
		isDeleteAllowed, isForm, isReadOnly, isSingle, isVirtual, onChange, onCreatorAdd,
		onCreatorRemove, onCreatorTypeSwitch, onDragStatusChange, onReorder, onReorderCancel,
		onReorderCommit, shouldPreOpenModal } = props;

	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const shouldUseModalCreatorField = useSelector(state => state.device.shouldUseModalCreatorField);
	const [isEditing, ] = useEditMode();
	const [active, setActive] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(
		shouldUseModalCreatorField && shouldUseEditMode && isEditing && shouldPreOpenModal
	);
	const fieldComponents = useRef({});

	const icon = 'name' in creator ? '20/input-dual' : '20/input-single';
	const isDual = 'lastName' in creator;
	const creatorLabel = useMemo(() => {
		const creatorTypeDescription = creatorTypes.find(c => c.value == creator.creatorType) ||
			{ label: creator.creatorType };
		return creatorTypeDescription.label;
	}, [creator, creatorTypes]);

	useImperativeHandle(ref, () => ({
		focus: () => {
			const key = 'lastName' in creator ? 'lastName' : 'name';
			if(!isReadOnly && !isForm) {
				setActive(key);
			} else {
				key in fieldComponents.current && fieldComponents.current[key].focus();
			}
		}
	}));

	const handleFieldClick = useCallback(ev => {
		const { fieldName } = ev.currentTarget.dataset;
		if(!isReadOnly) {
			setActive(fieldName);
		}
	}, [isReadOnly]);

	const handleFieldFocus = handleFieldClick;

	const handleCancel = useCallback(() => {
		setActive(null)
	}, []);

	const handleEditableCommit = useCallback((newValue, hasChanged, srcEvent) => {
		const { fieldName } = srcEvent.currentTarget.dataset;
		if(hasChanged) {
			onChange(index, fieldName, newValue);
		}
		if(isForm && srcEvent) {
			if(srcEvent.type == 'keydown' && srcEvent.key == 'Enter') {
				srcEvent.target.blur();
			}
		}
		setActive(null);
	}, [index, isForm, onChange]);

	const handleCreatorTypeSwitch = useCallback(() => {
		onCreatorTypeSwitch(index);
	}, [index, onCreatorTypeSwitch]);

	const handleCreatorRemove = useCallback(ev => {
		onCreatorRemove(index);
		ev && ev.stopPropagation();
		setIsModalVisible(false);
	}, [index, onCreatorRemove]);

	const handleCreatorAdd = useCallback(() => {
		onCreatorAdd(creator);
	}, [creator, onCreatorAdd]);

	const handleModalOpen = useCallback(ev => {
		if(isReadOnly) { return; }
		if(!shouldUseModalCreatorField) { return; }
		if(shouldUseEditMode && !isEditing) { return; }
		if(ev.type !== 'keydown' || (ev.key === 'Enter' || ev.key === ' ')) {
			setIsModalVisible(true);
		}
	}, [isEditing, isReadOnly, shouldUseEditMode, shouldUseModalCreatorField]);

	const handleModalClose = useCallback(() => {
		setIsModalVisible(false);
	}, []);

	const fieldClassName = cx({
		'creators-entry': true,
		'creators-oneslot': 'name' in creator,
		'creators-twoslot': 'lastName' in creator,
		'creators-modal-trigger': shouldUseModalCreatorField,
		'metadata': true,
		'single': isSingle,
		'virtual': isVirtual
	}, className);

	// raw formatted data for use in drag-n-drop indicator
	const raw = { ...creator, creatorType: creatorLabel };
	const inputProps = { active, creator, isForm, isReadOnly, label: creatorLabel, name, onCancel:
	handleCancel, onEditableCommit: handleEditableCommit, onFieldClick: handleFieldClick,
	onFieldFocus: handleFieldFocus, };

	return (
		<React.Fragment>
		{ isEditing && <CreatorFieldModal
			creatorLabel={ creatorLabel }
			isModalVisible={ isModalVisible }
			onClose={ handleModalClose }
			index={ index }
			active={ active }
			isReadOnly={ isReadOnly }
			onCancel={ handleCancel }
			onFieldClick={ handleFieldClick }
			onEditableCommit={ handleEditableCommit }
			onFieldFocus={ handleFieldFocus }
			onCreatorTypeSwitch={ handleCreatorTypeSwitch}
			onCreatorRemove={ handleCreatorRemove }
			onReorder={ onReorder }
			creatorTypes={ creatorTypes }
			creator={ creator }
			creatorsCount={ creatorsCount}
			isDual={ isDual }
			isForm={ isForm }
		/> }
		<Field
			className={ fieldClassName }
			index={ index }
			isSortable={ !isSingle && !isVirtual && !isReadOnly }
			key={ creator.id }
			onClick={ handleModalOpen }
			onKeyDown={ handleModalOpen }
			onReorder={ onReorder }
			onReorderCancel={ onReorderCancel }
			onReorderCommit={ onReorderCommit }
			onDragStatusChange={ onDragStatusChange }
			raw={ raw }
			tabIndex = { isEditing ? 0 : null }
		>
			{ shouldUseModalCreatorField ?
				<div className="truncate">{ creatorLabel }</div> :
				<CreatorTypeSelector
					data-field-name="creatorType"
					className="form-control form-control-sm"
					index={ index }
					inputComponent={ SelectInput }
					isActive={ active === 'creatorType' }
					isDisabled = { isReadOnly }
					onCancel={ handleCancel }
					onClick={ handleFieldClick }
					onCommit={ handleEditableCommit }
					onFocus={ handleFieldFocus }
					onReorder={ onReorder }
					options={ creatorTypes }
					ref={ component => fieldComponents.current['creatorType'] = component }
					value={ creator.creatorType }
					creatorsCount = { creatorsCount }
				/>
			}
			<React.Fragment>
				{
					shouldUseModalCreatorField ? (
						<div className="truncate">
							{ isVirtual ? isDual ? 'last name, first name' : 'name' :
								formatCreator(creator)
							}
						</div>
					) : (
						isDual ? (
							<React.Fragment>
								<CreatorFieldInputWrap
									{ ...inputProps }
									name="lastName"
									label="last name"
									ref={ component => fieldComponents.current['lastName'] = component }
								/>
								<CreatorFieldInputWrap
									{ ...inputProps }
									name="firstName"
									label="first name"
									ref={ component => fieldComponents.current['firstName'] = component }
								/>
							</React.Fragment> ) :
							<CreatorFieldInputWrap
								{ ...inputProps }
								name="name"
								label="name"
								ref={ component => fieldComponents.current['name'] = component }
							/>
					)
				}
				{
					!isReadOnly && (
						<React.Fragment>
							<Button
								icon
								className="btn-single-dual"
								onClick={ handleCreatorTypeSwitch }
							>
								<Icon type={ icon } width="20" height="20" />
							</Button>
							{
								isDeleteAllowed ? (
									<Button
										icon
										className="btn-minus"
										onClick={ handleCreatorRemove }
									>
										<Icon type={ '16/minus' } width="16" height="16" />
									</Button>
								) : (
									<Button icon className="btn-minus" disabled={ true }>
										<Icon type={ '16/minus' } width="16" height="16" />
									</Button>
								)
							}
							{
								isCreateAllowed ? (
									<Button
										icon
										className="btn-plus"
										onClick={ handleCreatorAdd }
									>
										<Icon type={ '16/plus' } width="16" height="16" />
									</Button>
								) : (
									<Button icon className="btn-plus" disabled={ true }>
										<Icon type={ '16/plus' } width="16" height="16" />
									</Button>
								)
							}
					</React.Fragment>
				)}
		</React.Fragment>
		</Field>
		</React.Fragment>
	);
});

CreatorField.displayName = 'CreatorField';
CreatorField.propTypes = {
	className: PropTypes.string,
	creator: PropTypes.object,
	creatorsCount: PropTypes.number,
	creatorTypes: PropTypes.array,
	index: PropTypes.number,
	isCreateAllowed: PropTypes.bool,
	isDeleteAllowed: PropTypes.bool,
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isSingle: PropTypes.bool,
	isVirtual: PropTypes.bool,
	onChange: PropTypes.func,
	onCreatorAdd: PropTypes.func,
	onCreatorRemove: PropTypes.func,
	onCreatorTypeSwitch: PropTypes.func,
	onDragStatusChange: PropTypes.func,
	onReorder: PropTypes.func,
	onReorderCancel: PropTypes.func,
	onReorderCommit: PropTypes.func,
	shouldPreOpenModal: PropTypes.bool,
};

export default memo(CreatorField);
