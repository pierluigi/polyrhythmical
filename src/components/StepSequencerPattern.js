import React from 'react';
import { Button, Input } from 'muicss/react';

class StepSequencerPattern extends React.Component {
  render() {
    let {pattern, patternKey, totalSteps} = this.props;

    let steps = totalSteps.map((_, stepKey) => {
      if (pattern.steps[stepKey] === undefined) {
        let color = pattern.currentStep === stepKey
          ? "primary"
          : "dark";

        return (
          <td key={stepKey}>
            <Button size="small" color={color} disabled={true} />
          </td>
        );
      }

      let color = pattern.steps[stepKey] != null
        ? "accent"
        : "dark";

      if (pattern.currentStep === stepKey) {
        color = "primary";
      }

      return (
        <td key={stepKey}>
          <Button size="small"
                  color={color}
                  onClick={this.props.onStepToggle.bind(this, patternKey, stepKey)}>
          </Button>
        </td>
      );
    });

    return (
      <tr key={patternKey}>
        <td>
          <Button size="small" color="dark" onClick={this.props.onAddStep.bind(null, patternKey)}>
            +
          </Button>
          <Button size="small" color="default" disabled>{pattern.steps == null ? 0 : Object.keys(pattern.steps).length}</Button>
          <Button size="small" color="dark" onClick={this.props.onRemoveStep.bind(null, patternKey)}>
            -
          </Button>
        </td>
        <td>
          <Input type="number" min="0" max="127"
                 value={pattern.noteNumber}
                 onChange={this.props.onPatternNoteChange.bind(null, patternKey)} />
        </td>
        {steps}
      </tr>
    );
  }
}

export default StepSequencerPattern;
