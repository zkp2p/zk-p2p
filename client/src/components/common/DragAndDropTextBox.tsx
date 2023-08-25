import React from "react";
import styled from 'styled-components';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Col } from "../legacy/Layout";


type Props = {
	onFileDrop: (file: File) => void;
};

export const DragAndDropTextBox: React.FC<Props> = ({onFileDrop}) => {
    const {
		dragging,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleDragEnd,
	} = useDragAndDrop();

	return (
		<DragAndDropTextBoxWrapper
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDrop={(e) => handleDrop(e, onFileDrop)}
		>
			{dragging ? (
				<div>Drop here</div>
			) : (
				<div>Drop .eml file here</div>
			)}
		</DragAndDropTextBoxWrapper>
	);
};

const DragAndDropTextBoxWrapper = styled(Col)`
	height: 16vh;
	border-radius: 4px;
	align-items: center;
	justify-content: center;
	border: 2px dashed #ccc;
	box-sizing: border-box;
	padding: 2px;
`;
