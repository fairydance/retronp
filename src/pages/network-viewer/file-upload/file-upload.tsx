import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import SendIcon from "@mui/icons-material/Send";
import type { SxProps, Theme } from '@mui/system';

interface FileUploadProps {
  sx?: SxProps<Theme>;
  disabled: boolean;
  onSubmit: () => void;
  running: boolean;
}

interface FileUploadState {
}

export default class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  public static defaultProps = {
    disabled: false,
    running: false
  };

  constructor(props: FileUploadProps) {
    super(props);
    this.handleLoadingButtonClick = this.handleLoadingButtonClick.bind(this);
  }

  handleLoadingButtonClick() {
    this.props.onSubmit();
  }

  render() {
    return (
      <Box sx={this.props.sx}>
        <LoadingButton
          disabled={this.props.disabled}
          onClick={this.handleLoadingButtonClick}
          endIcon={<SendIcon />}
          loading={this.props.running}
          loadingPosition="end"
          variant="contained"
        >
          {this.props.running ? "Running" : "Submit"}
        </LoadingButton>
      </Box>
    );
  }
}
