# Slider component

> [view source](https://github.com/wix/wix-style-react/blob/master/stories/Slider.js)

## Properties

| propName | propType | defaultValue | isRequired | description |
|----------|----------|--------------|------------|-------------|
| value | array of numbers | [2, 7] | - | The slider's selected range |
| min | number | - | - | The absolute minimum of the slider's range |
| max | number | false | - | The absolute maximum of the slider's range |
| step | number | - | - | The slider's step |
| onChange | func | - | + | Called upon every value change |
| onAfterChange | func | - | - | Called after every value change |
| allowCross | bool | - | - | Allows the slider's handles to cross. True by default |

## Usage

```js
import Slider from 'wix-style-react/Slider';

class ControlledSlider extends Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.number)
  };

  constructor({value}) {
    super();
    this.state = {value};
  }

  render() {
    const onChange = value => this.setState({value});

    return (
      <Slider {...this.props} value={this.state.value} onChange={onChange}/>
    );
  }
}

// single handle
<ControlledSlider value={[3]} min={1} max={10}/>

// multi handles
<ControlledSlider value={[3, 4, 5]} min={1} max={10}/>