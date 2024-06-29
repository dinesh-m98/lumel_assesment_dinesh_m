
import React, { useState, useEffect } from 'react';
import data from '../utils/data.json';

const Table = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Initialize rows with original values for variance calculation
    const initializeRows = (rows) => {
      return rows.map(row => ({
        ...row,
        originalValue: row.value,
        variance: 0,
        inputValue: 0,
        children: row.children ? initializeRows(row.children) : []
      }));
    };
    setRows(initializeRows(data.rows));
  }, []);

  const calculateVariance = (current, original) => {
    return ((current - original) / original) * 100;
  };

  const updateParentValues = (rows) => {
    // Update parent values based on their children's values
    return rows.map(row => {
      if (row.children.length > 0) {
        row.value = row.children.reduce((acc, child) => acc + child.value, 0);
        row.variance = calculateVariance(row.value, row.originalValue);
      }
      return row;
    });
  };

  const updateValue = (id, inputValue, type) => {
    // Update values and variances based on input
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        const originalValue = row.value;
        if (type === 'percent') {
          row.value = originalValue + (originalValue * inputValue / 100);
        } else if (type === 'value') {
          row.value = inputValue;
        }
        row.variance = calculateVariance(row.value, row.originalValue);
      } else if (row.children.length > 0) {
        row.children = row.children.map(child => {
          if (child.id === id) {
            const originalValue = child.value;
            if (type === 'percent') {
              child.value = originalValue + (originalValue * inputValue / 100);
            } else if (type === 'value') {
              child.value = inputValue;
            }
            child.variance = calculateVariance(child.value, child.originalValue);
          }
          return child;
        });
      }
      return row;
    });

    setRows(updateParentValues(updatedRows));
  };

  const handleInputChange = (e, id) => {
    const { value } = e.target;
    setRows(rows => rows.map(row => {
      if (row.id === id) {
        row.inputValue = parseFloat(value);
      } else if (row.children.length > 0) {
        row.children = row.children.map(child => {
          if (child.id === id) {
            child.inputValue = parseFloat(value);
          }
          return child;
        });
      }
      return row;
    }));
  };

  const renderRows = (rows, level = 0) => {
    return rows.map(row => (
      <React.Fragment key={row.id}>
        <tr>
          <td style={{ paddingLeft: `${level * 20}px` }}>{row.label}</td>
          <td>{row.value.toFixed(2)}</td>
          <td>
            <input
              type="number"
              onChange={(e) => handleInputChange(e, row.id)}
            />
          </td>
          <td>
            <button onClick={() => updateValue(row.id, row.inputValue, 'percent')}>Allocation %</button>
          </td>
          <td>
            <button onClick={() => updateValue(row.id, row.inputValue, 'value')}>Allocation Val</button>
          </td>
          <td>{row.variance.toFixed(2)}%</td>
        </tr>
        {row.children.length > 0 && renderRows(row.children, level + 1)}
      </React.Fragment>
    ));
  };

  const grandTotal = rows.reduce((acc, row) => acc + row.value, 0);

  return (
    <table border="1">
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
          <th>Input</th>
          <th>Allocation %</th>
          <th>Allocation Val</th>
          <th>Variance %</th>
        </tr>
      </thead>
      <tbody>
        {renderRows(rows)}
        <tr>
          <td><strong>Grand Total</strong></td>
          <td>{grandTotal.toFixed(2)}</td>
          <td colSpan="4"></td>
        </tr>
      </tbody>
    </table>
  );
};

export default Table;
