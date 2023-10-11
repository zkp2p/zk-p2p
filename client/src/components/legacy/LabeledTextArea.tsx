import _ from "lodash";
import React, { CSSProperties } from "react";
import styled from "styled-components";

import { Col } from "./Layout";


export const LabeledTextArea: React.FC<{
  style?: CSSProperties;
  className?: string;
  label: string;
  value: string;
  warning?: string;
  warningColor?: string;
  disabled?: boolean;
  disabledReason?: string;
  secret?: boolean;
  placeholder?: string;
  height?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}> = ({
  style,
  warning,
  warningColor,
  disabled,
  disabledReason,
  label,
  value,
  onChange,
  className,
  secret,
  placeholder,
  height = '16vh'
}) => {
  return (
    <LabeledTextAreaContainer
      className={_.compact(["labeledTextAreaContainer", className]).join(" ")}
      height={height}
    >
      <Label isEmpty={!label}>{label}</Label>
      {warning && (
        <span className="warning" style={{ color: warningColor }}>
          {warning}
        </span>
      )}
      <TextArea
        style={style}
        aria-label={label} 
        title={disabled ? disabledReason : ""}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
      />

      {secret && (
        <div className="secret">Hover to reveal public info sent to chain</div>
      )}
    </LabeledTextAreaContainer>
  );
};

const Label = styled.label<{ isEmpty: boolean }>`
  color: rgba(255, 255, 255, 0.8);
  padding-bottom: ${(props) => (props.isEmpty ? '0' : '10px')};
  padding-left: 8px;
`;

const LabeledTextAreaContainer = styled(Col)<{ height: string }>`
  height: ${(props) => props.height};
  border-radius: 4px;
  position: relative;

  & .warning {
    color: #bd3333;
    font-size: 80%;
  }

  .secret {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #171717;
    border: 1px dashed rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.8);
    user-select: none;
    pointer-events: none;
    opacity: 0.95;
    justify-content: center;
    display: flex;
    align-items: center;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover .secret,
  & :focus + .secret {
    opacity: 0;
  }
`;

const TextArea = styled.textarea`
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  height: 480px;
	padding: 16px;
	transition: all 0.2s ease-in-out;
	resize: none;

  &:hover {
		border: 1px solid rgba(255, 255, 255, 0.8);
  }
`;
