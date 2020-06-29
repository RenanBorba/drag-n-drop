import styled, { css } from 'styled-components';

// Ativar cor respectiva ao tipo de arquivo na zona de arraste Dropzone
const dragActive = css `
  border-color: #75e5d5
`;

const dragReject = css `
  border-color: #f21939
`;

export const DropContainer = styled.div.attrs({
  className: 'dropzone'

})`
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;

  transition: height 0.2s ease;

  ${props => props.isDragActive && dragActive};
  ${props => props.isDragReject && dragReject};
`;

const messageColors = {
  default: '#999',
  error:  '#f21939',
  success: '#75e5d5'
};

export const UploadMessage = styled.p `
  display: flex;
  color: ${props => messageColors[props.type || 'default' ]};
  justify-content: center;
  align-content: center;
  padding: 15px 0
`;