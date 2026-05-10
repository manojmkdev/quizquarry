import React from 'react';
class ErrorHandler extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="card text-danger">Something went wrong.</div>;
    return this.props.children;
  }
}
export default ErrorHandler;
