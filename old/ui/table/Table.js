import React, { Component } from 'react';
import './Table.css';

class Table extends Component {
  renderRows (rows) {
    if (rows !== null && rows.length > 0) {
      return (
        rows.map(
          (row, index) => (
            <tr key = { index }>
              { this.renderRow(row, index) }
            </tr>
          )
        )
      );
    }
  }
  renderRow (row, index) {
    return (
      Object.values(row).map(
        (item, index) => (
          this.renderCell(item, index)
        )
      )
    );
  }
  renderCell (cell, index) {
    return (
      <td key = { index }>
        { cell }
      </td>
    )
  }
  render() {
    if (this.props.rows !== null && this.props.rows.length > 0) {
      return (
        <table className = { this.props.className ? 'table ' + this.props.className : 'table' }>
          <caption>{ this.props.caption ? this.props.caption : '' }</caption>
          <tbody>
            { this.renderRows (this.props.rows) }
          </tbody>
        </table>
      );
    }
    else return null;
  }
}

export default Table;
