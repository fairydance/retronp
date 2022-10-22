import React from "react";
import { Box, Button, FormControl, FormHelperText, Typography } from "@mui/material";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import Dropzone from 'react-dropzone';
import FileListItem from "./file-list-item";
import "./file-input.scss"

export interface FileInputProps {
  value: File[];
  maxSize: number;
  disabled: boolean;
  onChange: (files: File[]) => void;
  onSubmit: () => void;
}

interface FileInputState {}

export default class FileInput extends React.Component<FileInputProps, FileInputState> {
  public static defaultProps = {
    disabled: false,
  };

  constructor(props: FileInputProps) {
    super(props);
    this.handleLoadingButtonClick = this.handleLoadingButtonClick.bind(this);
  }

  handleLoadingButtonClick() {
    this.props.onSubmit();
  }

  remove = (index: number) => {
    const files = [...this.props.value];
    files.splice(index, 1);
    this.props.onChange(files);
  };

  render() {
    return (
      <Dropzone
        multiple={false}
        maxSize={this.props.maxSize}
        disabled={this.props.disabled}
        onDropAccepted={this.props.onChange}
        noClick={true}
        noKeyboard={true}
      >
        {({fileRejections, getRootProps, getInputProps, open}) => {
          const isFileTooLarge = this.props.maxSize !== undefined && fileRejections.length > 0 && fileRejections[0].file.size > this.props.maxSize;
          const files = this.props.value?.map((file, i) => <FileListItem key={file.name} name={file.name} onDelete={() => this.remove(i)} />);
          return (
            <Box className="file-input-box" {...getRootProps()}>
              <FormControl className="form-control" error={isFileTooLarge}>
                <input {...getInputProps()} />
                <FileOpenIcon className="form-icon" color={this.props.disabled ? 'disabled' : 'primary'} />
                <Typography className="form-title" variant="caption">
                  Drag and drop a file here, or click to select a file
                </Typography>
                <div className="form-buttons">
                  <Button className="browse-button" variant="outlined" onClick={open} disabled={this.props.disabled}>
                    Browse
                  </Button>
                  <Button className="submit-button" variant="contained" onClick={this.handleLoadingButtonClick} disabled={this.props.disabled || files.length === 0}>
                    Submit
                  </Button>
                </div>
                <FormHelperText> {fileRejections[0]?.errors[0]?.message} </FormHelperText>
              </FormControl>
              {files.length > 0 && <Box className="file-list" component="ul">{files}</Box>}
            </Box>
          );
        }}
      </Dropzone>
    );
  }
}