import React, { Component } from 'react';
// Id único
import { uniqueId } from 'lodash';
import filesize from 'filesize';

import api from './services/api';
import Upload from './components/Upload';
import FileList from './components/FileList';
import { async } from 'q';

import GlobalStyle from './styles/global';
import { Container, Content } from './styles';

class App extends Component {
  state = {
    // Upload de arquivos
    uploadedFiles: []
  };

async componentDidMount() {
  const response = await api.get('posts');

  this.setState ({
    uploadedFiles: response.data.map(file => ({
      id: file._id,
      name: file.name,
      readableSize: filesize(file.size),
      preview: file.url,
      uploaded: true,
      url: file.url
    }))
  })
}

handleUpload = files => {
  const uploadedFiles = files.map(file => ({
    // Instância do objeto em si
    file,
    id: uniqueId(),
    name: file.name,
    // extensão do arquivo
    readableSize: filesize(file.size),
    preview: URL.createObjectURL(file),
    // inicialização Barra de progresso
    progress: 0,
    // inicialização Upload
    uploaded: false,
    // inicialização Erro
    error: false,
    url: null
  }))

  this.setState ({
    uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
  });

  uploadedFiles.forEach(this.processUpload);
};

updateFile = (id, data) => {
  this.setState({ uploadedFiles: this.state.uploadedFiles.map(
    uploadedFile => {
    return id === uploadedFile.id
      // sobrescrever dados
      ? { ...uploadedFile, ...data}
      : uploadedFile;
    })
  });
};

processUpload = (uploadedFile) => {
  const data = new FormData();

  // Requisição
  data.append('file', uploadedFile.file, uploadedFile.name);

  api.post('posts', data, {
    // Progresso da requisição
    onUploadProgress: e =>{
      // Monitoramento do progresso
      const progress = parseInt(Math.round((e.loaded*100)/e.total));

      this.updateFile(uploadedFile.id, {
        progress
      })
    }
  // Efetua após término do upload
  }).then( response => {
    this.updateFile(uploadedFile.id, {
      uploaded: true,
      // Id real via Mongo
      id: response.data._id,
      url: response.data.url
    });

  }).catch( response => {
    this.updateFile(uploadedFile.id, {
      error: true
    });
  });
};

handleDelete = async id => {
  // Excluir via rota da api
  await api.delete(`posts/${id}`);

  this.setState({
    uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id)
  })
}

// destrói cache
componentWillUnmount() {
  this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
}

  render(){
    const { uploadedFiles } = this.state;
    return (
    <Container>
      <Content>
        <Upload onUpload = { this.handleUpload } />
        {!!uploadedFiles.length &&
        (
          <FileList files = { uploadedFiles } onDelete={ this.handleDelete } />
        )}
      </Content>
      < GlobalStyle />
    </Container>
    );
  }
};

export default App;