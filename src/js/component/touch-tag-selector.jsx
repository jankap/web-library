import React, { useCallback, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import Button from './ui/button';
import { Toolbar } from './ui/toolbars';
import Icon from './ui/icon';

const TouchTagSelector = props => {
	const [isOpen, setIsOpen] = useState(false);
	const handleClick = useCallback(() => {
		setIsOpen(!isOpen);
	});

	return (
		<div className="touch-tag-selector">
			<CSSTransition
				in={ isOpen }
				timeout={ 600 }
				classNames="slide-up"
				mountOnEnter
				unmountOnExit
			>
				<div className="pane">
					<header className="touch-header">
						<Toolbar>
							<div className="toolbar-left" />
							<div className="toolbar-center">
								2 Tags Selected
							</div>
							<div className="toolbar-right">
								<Button className="btn-link" onClick={ handleClick }>Done</Button>
							</div>
						</Toolbar>
					</header>
					<div className="filter-container">
						<input type="text" className="form-control" placeholder="Filter Tags" />
					</div>
					<ul className="selected-tags">
						<li className="tag">
							<div className="tag-color" />
							Carbon Dioxide
						</li>
						<li className="tag">
							<div className="tag-color" />
							Carbonic Anhydrases
						</li>
					</ul>
					<div className="scroll-container">
						<ul className="tag-selector-list">
							<li className="tag">
								<div className="tag-color" style={{color: 'rgb(95, 178, 54)'}} />
								green-tag2
							</li>
							<li className="tag">
								<div className="tag-color" style={{color: 'rgb(255, 102, 102)'}} />
								red-tag
							</li>
							<li className="tag">
								<div className="tag-color" style={{color: 'rgb(46, 168, 229)'}} />
								Aldehyde Oxidoreductases
							</li>
							<li className="tag">
								<div className="tag-color" style={{color: 'rgb(162, 138, 229)'}} />
								purple-tag
							</li>
							<li className="tag">
								<div className="tag-color" />
								Adenosine Triphosphate
							</li>
						</ul>
					</div>
					<footer className="touch-footer">
						<Toolbar>
							<div className="toolbar-center">
								<Button className="btn-link">Deselect All</Button>
							</div>
						</Toolbar>
					</footer>
				</div>
			</CSSTransition>
			<footer className="touch-footer darker">
				<Toolbar>
					<div className="toolbar-left">
						<Button className="btn-icon" onClick={ handleClick }>
							<Icon type="24/tag" width="24" height="24" />
						</Button>
					</div>
					<div className="toolbar-center">
						2 Tags Selected
					</div>
					<div className="toolbar-right" />
				</Toolbar>
			</footer>
		</div>
	);
}

export default TouchTagSelector;
