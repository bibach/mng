import React, { Component } from 'react';
import { render, findDOMNode } from 'react-dom';
import Storage from 'react-native-storage';
//import { AsyncStorage } from 'react-native';
//export { Modal, View, Text, TextInput, Button, Switch } from 'react-web';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = {}; }
  componentDidCatch(error, info) { this.setState({ error, info, }); }
  render() {
    const { error, info } = this.state;
    return !error ? this.props.children :
      <div className="errorboundary">
        <h2>An error occurred</h2>
        <div className="message">{JSON.stringify(error)}</div>
        {info && info.componentStack && <div className="stack">{info.componentStack}</div>}
      </div>;
  }
}

const storage = new Storage({
  storageBackend: window.localStorage, // AsyncStorage // for native
  defaultExpires: 1000 * 3600 * 24 * 3650, // ~ 10 years
});

const initApp = App => {
  render(<ErrorBoundary><App storage={storage}/></ErrorBoundary>, document.getElementById('root'));
};

const log = x => {
  var cache = [];
  console.log("INFO: " + JSON.stringify(x, (k, v) => {
    if (typeof v === 'object' && v !== null) {
      if (k === '_owner') { return; }
      if (cache.indexOf(v) !== -1) { return; } // Cached, discard
      cache.push(v);
    }
    return v;
  }, 2));
  cache = null;
  return x;
}

class StyleSheet {
  static create(style) { return style; }
}

const Constants = {
  statusBarHeight: 24,
}

const zeros = { left: 0, right: 0, bottom: 0, top: 0, };
const styles = StyleSheet.create({
  modal: { position: 'fixed', ...zeros, zIndex: 9999, },
  shade: { position: 'absolute', ...zeros, backgroundColor: '#333', opacity: 0.7, },
  container: {
    position: 'absolute', left: 20, right: 20, top: "50%", transform: "translate(0, -50%)",
    backgroundColor: '#fff', opacity: 1, borderRadius: 10, padding: 10, },
  switchSpan: {
    position: 'relative', display: 'inline-block', margin: 2, height: 30, width: 50, cursor: 'default',
    verticalAlign: 'middle', borderRadius: 20, borderColor: '#dfdfdf', borderWidth: 1, borderStyle: 'solid',
    WebkitUserSelect: 'none', WebkitBoxSizing: 'content-box', WebkitBackfaceVisibility: 'hidden', },
  disabledSwitchSpan: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none', },
  checkedSwitchSmall: { WebkitTransform: 'translateX(20px)', },
  uncheckedSwitchSmall: { WebkitTransform: 'translateX(0)', },
  textinput: {
    appearance: 'none', backgroundColor: 'transparent', borderColor: 'black',
    borderWidth: 0, boxSizing: 'border-box', color: 'inherit',
    font: 'inherit', padding: 0, height: 30, },
});

const Modal = props => {
  var style = { visibility: props.visible === undefined || props.visible ? "visible" : "hidden" };
  return (
    <div style={{ ...styles.modal, ...style, }}>
      <div style={{ ...styles.shade, }} onClick={props.onRequestClose}/>
      <div style={{ ...styles.container, }}>{props.children}</div>
    </div>);
}

const View = props =>
  <div style={props.style} onClick={props.onPress}>{props.children}</div>;

const Text = props =>
  <span style={props.style} onClick={props.onPress}>{props.children}</span>;

class TextInput extends Component {
  static typeMap = {
    'default': 'text', 'ascii-capable': 'text', 'numbers-and-punctuation': 'number',
    'url': 'url', 'number-pad': 'number', 'phone-pad': 'tel',
    'name-phone-pad': 'text', 'email-address': 'email', 'decimal-pad': 'number',
    'twitter': 'text', 'web-search': 'search', 'numeric': 'number' };

  static defaultProps = {
    editable: true, multiline: false, secureTextEntry: false,
    keyboardType: 'default', autoFocus: false };

  _onBlur(e) {
    const { onBlur } = this.props;
    if (onBlur) { e.nativeEvent.text = e.target.value; onBlur(e); }
  }

  _onChange(e) {
    const { onChange, onChangeText } = this.props;
    if (onChangeText) onChangeText(e.target.value);
    if (onChange) { e.nativeEvent.text = e.target.value; onChange(e); }
  }

  _onFocus(e) {
    const { clearTextOnFocus, onFocus, selectTextOnFocus } = this.props;
    const node = findDOMNode(this);
    if (clearTextOnFocus) node.value = '';
    if (selectTextOnFocus) node.select();
    if (onFocus) { e.nativeEvent.text = e.target.value; onFocus(e); }
  }

  _onSelectionChange(e) {
    const { onSelectionChange } = this.props;
    if (onSelectionChange) {
      const { selectionDirection, selectionEnd, selectionStart } = e.target;
      e.nativeEvent.text = e.target.value;
      const event = {
        selectionDirection, selectionEnd, selectionStart, nativeEvent: e.nativeEvent };
      onSelectionChange(event);
    }
  }

  _onKeyPress(e) {
    const { multiline, onKeyPress, onSubmitEditing } = this.props;
    if (onKeyPress) {
      let keyValue;
      switch (e.which) {
        case  8: keyValue = 'Backspace'; break;
        case  9: keyValue = 'Tab'; break;
        case 13: keyValue = 'Enter'; break;
        case 32: keyValue = ' '; break;
        default: {
          keyValue = String.fromCharCode(e.which).trim();
          if (!e.shiftKey) { keyValue = keyValue.toLowerCase(); }
        }
      }
      if (keyValue) {
        e.nativeEvent = { altKey: e.altKey, ctrlKey: e.ctrlKey, key: keyValue,
          metaKey: e.metaKey, shiftKey: e.shiftKey, target: e.target, };
        onKeyPress(e);
      }
    }
    if (!e.isDefaultPrevented() && e.which === 13 && !e.shiftKey) {
      if (!multiline && onSubmitEditing) {
        e.nativeEvent = { target: e.target, text: e.target.value, };
        onSubmitEditing(e);
      }
    }
  }

  componentDidMount() {
    if (this.props.autoFocus) { findDOMNode(this.refs.input).focus(); }
  }

  render() {
    const { accessibilityLabel, autoComplete, autoFocus, defaultValue, editable,
      keyboardType, maxLength, maxNumberOfLines, multiline, numberOfLines, onBlur,
      onChange, onKeyDown, onKeyUp, onKeyPress, onChangeText, onSelectionChange,
      onSubmitEditing, placeholder, password, secureTextEntry, style, value } = this.props;
    const propsCommon = {
      ref: 'input', 'aria-label': accessibilityLabel,
      autoComplete: autoComplete && 'on', autoFocus, defaultValue, maxLength,
      onBlur: onBlur && this._onBlur.bind(this), onFocus: this._onFocus.bind(this),
      onChange: (onChange || onChangeText) && this._onChange.bind(this), onKeyDown, onKeyUp,
      onSelect: onSelectionChange && this._onSelectionChange.bind(this), placeholder,
      readOnly: !editable, style: { ...styles.textinput, ...style }, value,
      onKeyPress: (onKeyPress || onSubmitEditing) && this._onKeyPress.bind(this) };
    let input;
    if (multiline) {
      const propsMultiline = {
        ...propsCommon,
        maxRows: maxNumberOfLines || numberOfLines,
        minRows: numberOfLines };
      input = <textarea {...propsMultiline} />;
    } else {
      let type = TextInput.typeMap[keyboardType];
      if (password || secureTextEntry) { type = 'password'; }
      const propsSingleline = { ...propsCommon, type };
      input = <input {...propsSingleline} />;
    }

    if (this.props.children) {
      return (
        <View>
          {input}
          {this.props.children}
        </View>); }
    else { return input; }
  }
};

const Button = props =>
  <button style={props.style} title={props.accessibilityLabel} {...(props.disabled ? { disabled: "disabled", } : {})} onClick={props.onPress}>{props.children}</button>;

class Switch extends Component {
  static defaultProps = { onTintColor: '#00e1f8', thumbTintColor: '#fff', tintColor: '#fff', }

  state = { value: this.props.value, disabled: this.props.disabled, }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value, disabled: nextProps.disabled, });
  }

  getStyles({ onTintColor, thumbTintColor, tintColor }) {
    return {
      checkedSwitchSpan: {
        borderColor: onTintColor, backgroundColor: onTintColor,
        boxShadow: onTintColor + ' 0 0 0 16px inset',
        WebkitTransition: 'border 0.2s, box-shadow 0.2s, background-color 1s', },
      uncheckedSwitchSpan: {
        borderColor: '#dfdfdf', backgroundColor: tintColor, boxShadow: '#dfdfdf 0 0 0 0 inset',
        WebkitTransition: 'border 0.2s, box-shadow 0.2s', },
      switchSmall: {
        position: 'absolute', top: 0, width: 30, height: 30, backgroundColor: thumbTintColor,
        borderRadius: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        WebkitTransition: '-webkit-transform 0.2s ease-in', },
    };
  }

  handleClick(e) {
    if (this.state.disabled) { return null; }
    var newVal = !this.state.value;
    this.props.onValueChange && this.props.onValueChange.call(this, newVal);
    this.setState({ value: newVal, });
    var oldVal = this.props.value;
    setTimeout(function() {
      if (this.props.value === oldVal) { this.setState({ value: this.props.value, }); }
    }.bind(this), 200);
  }

  render() {
    var style = { ...styles, ...(this.getStyles(this.props)), };
    var spancss = { ...style.switchSpan, ...(this.state.disabled ? style.disabledSwitchSpan : {}),
      ...(this.state.value ? style.checkedSwitchSpan : style.uncheckedSwitchSpan), };
    var smallcss = { ...style.switchSmall,
      ...(this.state.value ? style.checkedSwitchSmall : style.uncheckedSwitchSmall), };
    return (
      <span onClick={this.handleClick.bind(this)} style={spancss}>
        <small style={smallcss}/>
      </span>
    );
  }
}

export { initApp, log, StyleSheet, Constants, Modal, View, Text, TextInput, Button, Switch };
