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
        class WithValidation extends React.Component {
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
                this.resetFormData = this.resetFormData.bind(this);
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

            /**
             * This method is presented as prop to the wrapped component
             * and resets the formData.
             */
            resetFormData() {
                return new Promise(res => {
                    this.setState({ formData: initialValues }, res);
                });
            }

            /**
             * This method is presented as prop to the component
             * and updates the formData.
             *
             * @param {object} changes The changes to apply to the formData
             */
            updateFormData(changes) {
                if (
                    changes === null ||
                    typeof changes !== "object" ||
                    Array.isArray(changes)
                )
                    throw new Error(
                        "A non-object was given to updateFormData!"
                    );

                return new Promise(res => {
                    const formData = Object.assign(
                        {},
                        this.state.formData,
                        changes
                    );
                    this.setState({ formData }, res);
                });
            }

            // Pass on props to wrapped component
            render() {
                return factory(
                    Object.assign({}, this.props, {
                        validationErrors: this.state.errors,
                        formData: this.state.formData,
                        isValid: this.state.isValid,
                        updateFormData: this.updateFormData,
                        resetFormData: this.resetFormData
                    })
                );
            }
        }

        WithValidation.childContextTypes = {
            publish: PropTypes.func,
            submit: PropTypes.func
        };

        WithValidation.displayName = `WithValidation(${getDisplayName(
            WrappedComponent
        )})`;

        return WithValidation;
    };
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
