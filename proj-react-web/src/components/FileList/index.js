import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { MdCheckCircle, MdError, MdLink  } from 'react-icons/md';

import { Container, FileInfo, Preview } from './styles';

const FileList = ({ files, onDelete }) => (
  <Container>
    { files.map(uploadedFile => (
      <li key={ uploadedFile.id }>
        <FileInfo>
          <Preview src= { uploadedFile.preview } />
            {/* Informações da Imagem */}
            <div>
              <strong>{ uploadedFile.name }</strong>
                <span>
                  { uploadedFile.readableSize }{' '}
                    {!!uploadedFile.url && (
                      <button onClick={() => onDelete(uploadedFile.id)}>
                        Excluir
                      </button>
                      )}
                </span>
            </div>
        </FileInfo>

          <div>
            {/* Se ainda não foi realizado o upload do arquivo e
            o mesmo não contiver erro, mostrar Progressbar */}
            { !uploadedFile.uploaded && !uploadedFile.error && (
              <CircularProgressbar value={ uploadedFile.progress }
                styles= {{
                  /* Área ao redor da Progressbar  */
                  root: { width: 24},
                  /* Cor Barra de progresso  */
                  path: { stroke: '#0077CF',
                  /* Largura e porcentagem da Progressbar */
                  strokeWidth: 10 }
                }}
              />
            )}

            { uploadedFile.url && (
              <a
                href = { uploadedFile.url }
                //Redirecionamento
                target = "_blank"
                rel = "noopener noreferrer"
              >
                <MdLink style = {{ marginRight: 8 }} size={24} color="#222" />
              </a>
            )}

            { uploadedFile.uploaded && <MdCheckCircle size = {24} color="#75e5d5" /> }
            { uploadedFile.error && <MdError size = {24} color="#f21939" /> }
        </div>
      </li>
    ))}
  </Container>
);

export default FileList;