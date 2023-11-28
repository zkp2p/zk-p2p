import React from 'react';
import Checkbox from "@mui/joy/Checkbox";


interface CustomCheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
}) => {
  return (
    <Checkbox
      size="sm"
      color="primary"
      variant="plain"
      checked={checked}
      onChange={onChange}
    />
  );
};
