import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * The Field class should be used instead of any input
 * element on the page which has to be validated.
 * Use the property "as" to define the component it should
 * actually render.
 */
class Field extends Component {
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

export { Field };
