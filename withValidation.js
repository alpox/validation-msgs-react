import React from "react";
import PropTypes from "prop-types";

// The function for creating a validation HOC
export function withValidation(
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
                this.updateFormData = this.updateFormData.bind(this);
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

            updateFormData(changes) {
                const formData = Object.assign(
                    {},
                    this.state.formData,
                    changes
                );
                this.setState({ formData });
            }

            // Pass on props to wrapped component
            render() {
                return factory(
                    Object.assign({}, this.props, {
                        validationErrors: this.state.errors,
                        formData: this.state.formData,
                        isValid: this.state.isValid,
                        updateFormData: this.updateFormData
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
