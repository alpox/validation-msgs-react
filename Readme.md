# validation-msgs-react

This is a library originally created for the use with
[validation-msgs](https://github.com/alpox/validation-msgs) but can be used with
any validation function.

Features:

* `Field` Component which grabs the input values
* `withValidation` HOC which provides the form values and validation errors to
  the wrapped component

## Usage

```
import React, { Component } from "react";
import { validate, v, isRequired, passwordComplexity } from "validation-msgs";
import {
  withValidation,
  Form,
  Field
} from "validation-msgs-react";

class FormComponent extends Component {
  render() {
    const errors = this.props.validationErrors;
    const formData = this.props.formData;
    const isValid = this.props.isValid;

    return (
      <Form>
        <Field type="text" value={formData.username} name="username" />
        {!isValid && errors.username}
        <br />
        <Field type="password" value={formData.password} name="password" />
        {!isValid && errors.password}
        <br />
        <input type="submit" value="Submit" />
      </Form>
    );
  }
}

const validation = validate({
  username: v(isRequired()),
  password: v(isRequired(), passwordComplexity())
});

export default withValidation(validation, { username: "elias", password: "" })(
  FormComponent
);
```

ValidationForm is used to capture the submission state of the form. Both `Field`
and `Form` accept the property `as` with which you can specify what component
you want to render at that place. Possible variants:

```
<Form as="form">
<Form as={AnyFormComponent}>
----
<Field as="input">
<Field as={DropDown}>
```

## withValidation(validationFunction, initialValues, opts)

> Returns a function for wrapping a component to wrap it in the validation HOC.

#### Parameters

* validationFunction - A function which takes the form data and returns a
  datastructure providing the validation result
* initialValues - The initial values for your form inputs (For the formData)
* opts - Optional arguments

#### Properties for opts

* afterSubmit: Boolean : default = true

If afterSubmit is set to true, the form will only be validated after it once
submitted. Otherwise, the validation happens on any change of an input.

## The HOC

The Higher Order Component for validation provides your Component with the
following properties:

* formData -An object containing the data of all input fields
* validationErrors - An object which is the result of the validation function
  you provided as first argument to `withValidation`
* isValid - A boolean identifying the valid state of the form
