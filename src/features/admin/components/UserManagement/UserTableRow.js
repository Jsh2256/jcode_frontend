import React, { memo } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CELL_STYLE } from '../AdminTable';

const UserTableRow = memo(({ 
  item, 
  itemIndex,
  onRoleChange, 
  onOpenDialog
}) => {
  return (
    <TableRow key={item.id}>
      <TableCell sx={CELL_STYLE}>{itemIndex}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.name}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.studentId}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.email}</TableCell>
      <TableCell sx={CELL_STYLE}>
        <Select
          size="small"
          value={item.role || 'STUDENT'}
          onChange={(e) => onRoleChange(item.id, e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="STUDENT">학생</MenuItem>
          <MenuItem value="ASSISTANT">조교</MenuItem>
          <MenuItem value="PROFESSOR">교수</MenuItem>
        </Select>
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDialog('edit', item);
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDialog('delete', item);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

export default UserTableRow; 