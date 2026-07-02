import React from 'react';
import { Container as BootstrapContainer } from 'react-bootstrap';

interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  className = '',
}) => {
  return (
    <BootstrapContainer fluid={fluid} className={`px-3 px-md-4 px-lg-5 ${className}`}>
      {children}
    </BootstrapContainer>
  );
};

export default Container;
