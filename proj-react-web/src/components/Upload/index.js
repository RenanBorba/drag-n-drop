import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import { DropContainer, UploadMessage } from './styles';

export default class Upload extends Component {
  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return <UploadMessage>Arraste arquivos aqui...</UploadMessage>
    }

    if (isDragReject) {
      return <UploadMessage type="error">Arquivo não suportado!</UploadMessage>
    }

    return <UploadMessage  type="success">Solte o arquivo selecionado aqui</UploadMessage>
  };

  render() {
    const { onUpload } = this.props;

    return (
      /* Permissão de qualquer tipo de imagem para upload
      Render Props -- Propiedades do Upload */
      <Dropzone accept ="image/*" onDropAccepted={ onUpload }>
        { ({ getRootProps, getInputProps, isDragActive, isDragReject }) =>
          <DropContainer
            { ... getRootProps()}
            className
            isDragActive = {isDragActive}
            isDragReject = {isDragReject}
          >

            <input { ... getInputProps()} />

            {this.renderDragMessage( isDragActive, isDragReject )}
          </DropContainer>
        }
      </Dropzone>
    );
  }
};