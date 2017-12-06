import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * The Form class should be used instead of any form
 * element on the page which has to be validated.
 * Use the property "as" to define the component it should
 * actually render.
 */
class Form extends Component {
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

export { Form };
