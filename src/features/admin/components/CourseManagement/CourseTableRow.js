import React, { memo } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CELL_STYLE } from '../AdminTable';

const CourseTableRow = memo(({ 
  item, 
  itemIndex,
  isDarkMode,
  onOpenDialog
}) => {
  return (
    <TableRow key={item.courseId}>
      <TableCell sx={CELL_STYLE}>{itemIndex}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.courseName}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.courseCode}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.professor}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.year}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.term}</TableCell>
      <TableCell sx={CELL_STYLE}>{item.clss}</TableCell>
      <TableCell sx={CELL_STYLE}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: item.vnc 
              ? (isDarkMode ? '#50FA7B' : '#1b5e20')  // 다크모드: 밝은 초록, 라이트모드: 진한 초록
              : (isDarkMode ? '#FF5555' : '#b71c1c'), // 다크모드: 밝은 빨강, 라이트모드: 진한 빨강
            fontWeight: 900,
            fontSize: '1rem'
          }}
        >
          {item.vnc ? '○' : '✕'}
        </Box>
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

export default CourseTableRow; 