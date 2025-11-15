import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import i18n from '../i18n/config';

// Wrapper component para testes
const Wrapper = ({ children }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  </BrowserRouter>
);

describe('Button Component', () => {
  test('renderiza com texto correto', () => {
    render(
      <Button>Click me</Button>,
      { wrapper: Wrapper }
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('chama onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick}>Click</Button>,
      { wrapper: Wrapper }
    );
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('desabilita quando disabled é true', () => {
    render(
      <Button disabled>Disabled</Button>,
      { wrapper: Wrapper }
    );
    
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  test('mostra loading spinner quando loading é true', () => {
    render(
      <Button loading>Loading</Button>,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Loading')).toBeInTheDocument();
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveClass('animate-spin');
  });

  test('aplica variante de estilo corretamente', () => {
    const { container } = render(
      <Button variant="danger">Delete</Button>,
      { wrapper: Wrapper }
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
  });
});

describe('Input Component', () => {
  test('renderiza com label e placeholder', () => {
    render(
      <Input label="Username" placeholder="Enter username" />,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  test('atualiza valor quando digitado', () => {
    const handleChange = jest.fn();
    render(
      <Input onChange={handleChange} value="" />,
      { wrapper: Wrapper }
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('mostra mensagem de erro', () => {
    render(
      <Input error="This field is required" />,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('marca required com asterisco', () => {
    render(
      <Input label="Email" required />,
      { wrapper: Wrapper }
    );
    
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
  });

  test('desabilita input quando disabled é true', () => {
    render(
      <Input disabled />,
      { wrapper: Wrapper }
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});

describe('Alert Component', () => {
  test('renderiza mensagem de sucesso', () => {
    render(
      <Alert type="success" message="Operation successful" />,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  test('renderiza titulo e mensagem', () => {
    render(
      <Alert
        type="info"
        title="Information"
        message="This is important"
      />,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('This is important')).toBeInTheDocument();
  });

  test('chama onClose quando botão de fechar é clicado', () => {
    const handleClose = jest.fn();
    render(
      <Alert
        type="error"
        message="Error occurred"
        onClose={handleClose}
      />,
      { wrapper: Wrapper }
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('renderiza diferentes tipos de alerta', () => {
    const { rerender } = render(
      <Alert type="error" message="Error" />,
      { wrapper: Wrapper }
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    rerender(
      <Alert type="warning" message="Warning" />
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
