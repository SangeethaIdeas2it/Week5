import styled from 'styled-components/macro';

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  @media only screen and (min-width: ${({ theme: { breakpoints } }) =>
      breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media only screen and (min-width: ${({ theme: { breakpoints } }) =>
      breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// Loading state styles
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  color: #6c757d;
  font-size: 1rem;
`;

// Error state styles
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 2rem;
`;

export const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 500px;
`;

export const RetryButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

export const DismissButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #545b62;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(108, 117, 125, 0.25);
  }
`;

// Empty state styles
export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

export const EmptyTitle = styled.h2`
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const EmptyMessage = styled.p`
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 500px;
`;
