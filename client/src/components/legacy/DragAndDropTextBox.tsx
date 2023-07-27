import React from "react";
import styled from 'styled-components';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Col } from "./Layout";


type Props = {
	onFileDrop: (file: File) => void;
};

export const DragAndDropTextBox: React.FC<Props> = ({
  onFileDrop
}) => {
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
	display: flex;
	flex-direction: column;
	align-items: center;
	border: 2px dashed #ccc;
	padding: 20px;
`;
