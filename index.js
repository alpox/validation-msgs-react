import PropTypes from "prop-types";
import React from "react";

/**
 * The Form class should be used instead of any form
 * element on the page which has to be validated.
 * Use the property "as" to define the component it should
 * actually render.
 */
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.submitHandler = this.submitHandler.bind(this);
  }

  submitHandler(e) {
    if (!this.context)
      throw new Error(
        "The Field component was used inside" +
          "of a Component which is not wrapped into a validation HOC!"
      );

    e.preventDefault();

    this.context.submit(e);
  }

  render() {
    const { as: ActualElement = "form" } = this.props;

    const propsToPass = Object.assign({}, this.props, {
      onSubmit: this.submitHandler
    });
    delete propsToPass.as;

    return React.createElement(ActualElement, propsToPass);
  }
}

Form.contextTypes = {
  submit: PropTypes.func
};

/**
 * The Field class should be used instead of any input
 * element on the page which has to be validated.
 * Use the property "as" to define the component it should
 * actually render.
 */
class Field extends React.Component {
  constructor(props) {
    super(props);
    this.changeHandler = this.changeHandler.bind(this);
  }

  // Handle the change of the input.
  // Pass on to original onChange event handler
  // As well as to wrapper.
  changeHandler(e) {
    if (!this.context)
      throw new Error(
        "The Field component was used inside" +
          "of a Component which is not wrapped into a validation HOC!"
      );
    this.context.publish(e);

    if (this.props.onChange) this.props.onChange(e);
  }

  render() {
    const { as: ActualElement = "input" } = this.props;

    const propsToPass = Object.assign({}, this.props, {
      onChange: this.changeHandler
    });
    delete propsToPass.as;

    return React.createElement(ActualElement, propsToPass);
  }
}

Field.contextTypes = {
  publish: PropTypes.func
};

// The function for creating a validation HOC
function withValidation(
  validation,
  initialValues,
  opts = { afterSubmit: true }
) {
  return function(WrappedComponent) {
    const factory = React.createFactory(WrappedComponent);
    class Wrapper extends React.Component {
      constructor(props) {
        super(props);

        // Set initial values
        this.state = {
          errors: {},
          formData: initialValues,
          isValid: true,
          isSubmitted: false
        };

        this.acceptChange = this.acceptChange.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
      }

      // Validate the form with the new data
      acceptChange(e) {
        const formData = Object.assign({}, this.state.formData, {
          [e.target.name]: e.target.value
        });

        this.setState({ formData }, this.validate);
      }

      validate() {
        const formData = this.state.formData;
        const errors = validation(formData);
        const isValid = !Object.keys(errors).length;

        if (!opts.afterSubmit || this.state.isSubmitted)
          this.setState({ errors, isValid });
      }

      formSubmit(e) {
        this.setState({ isSubmitted: true }, () => {
          if (opts.afterSubmit) this.validate();
        });
      }

      getChildContext() {
        return {
          publish: this.acceptChange,
          submit: this.formSubmit
        };
      }

      // Pass on props to wrapped component
      render() {
        return factory(
          Object.assign({}, this.props, {
            validationErrors: this.state.errors,
            formData: this.state.formData,
            isValid: this.state.isValid
          })
        );
      }
    }

    Wrapper.childContextTypes = {
      publish: PropTypes.func,
      submit: PropTypes.func
    };

    return Wrapper;
  };
}

export { Form, Field, withValidation };
