import React from 'react';
import Select from 'react-select';

export function SearchableSelect({ options, value, onChange }) {
    return (
        <Select
            value={options.find(option => option.value === value)}
            onChange={selectedOption => onChange(selectedOption.value)}
            options={options}
            className="react-select-container"
            classNamePrefix="react-select"
        />
    );
}
