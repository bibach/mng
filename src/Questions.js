import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { log, StyleSheet, View, Text, Button } from './Env';
import { ValuesDialog } from './ValuesDialog';

class Questions extends Component {
  constructor(props) {
    super(props);
    this.update = state => Object.keys(this.refs).reduce(
      (s, r) => ({ ...s, [this.refs[r].name]: this.refs[r].value(-1, s), }), { ...state, });
    this.state = { log, question: 0, };
  }

  static propTypes = {
    storage: PropTypes.object, answer: PropTypes.func, testAnswers: PropTypes.func,
  };

  walk(step = 1, test = this.props.testAnswers, start = this.state.question) {
    var len = Children.count(this.props.children), q = start;
    do { q = (q + step + len) % len; } while (!test(this.refs['q' + q].active));
    this.setState({ question: q, });
  }

  pick(value) {
    this.props.answer(s => {
      var c = this.state.question, q = this.refs['q' + c], n = q.name;
      var v = q.value(value, s), a = { [n]: v, }, ns = { ...s, ...a };
      this.walk(1, a => a(ns));
      while (++c < Children.count(this.props.children)) {
        q = this.refs['q' + c]; n = q.name; v = q.value(-1, ns);
        if ((a[n] === null && v !== null) || a[n] === undefined) { ns[n] = a[n] = v; }
      }
      return a;
    });
  }

  render() {
    const { children, storage } = this.props;
    return Children.map(children, (child, index) =>
      cloneElement(child, { position: index, ref: 'q' + index,
        current: this.state.question, storage: storage, back: () => { this.walk(-1); },
        roll: () => { this.pick(Math.random()); }, pick: v => { this.pick(v - 1); }, }));
  }
}

class Question extends Component {
  constructor(props) {
    super(props);
    var ph = props.placeholder;
    this.name = props.name || props.title.toLowerCase().replace("-", "");
    this.active = props.active || (s => true);
    this.placeholder = typeof ph === "function" ? ph :
      (s => this.active(s) ? (ph || "_").replace("_", "____") : null);
    this.state = { valuesDialog: false, values: props.values, max: props.max, };
  }

  componentDidMount() {
    const { storage, data } = this.props;
    if (data)
      storage.load({ key: data, autoSync: false, }).then(values => { this.setState({ values, }); })
        .catch(err => { console.warn("Error loading " + data + " list: " + err.message); });
  }

  static propTypes = {
    position: PropTypes.number, current: PropTypes.number, storage: PropTypes.object,
    title: PropTypes.string.isRequired, name: PropTypes.string, data: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
      name: PropTypes.string.isRequired, active: PropTypes.bool, })])).isRequired,
    max: PropTypes.number, roll: PropTypes.func, pick: PropTypes.func, back: PropTypes.func,
    placeholder: PropTypes.oneOfType([PropTypes.func, PropTypes.string]), active: PropTypes.func,
  };

  mod(m) { this.setState(prev => { var s = [...prev.values]; m(s); return { values: s, }; }); }

  value(v, state) {
    var vals = this.getVals(), len = vals.length, i = v > 0 && v < 1 ? Math.floor(len * v) : v;
    return i >= 0 && i < len ? vals[i] : this.placeholder(state);
  }

  getVals({ values, max } = this.state) {
    var vals = values.map(v => v.active ? v.name : v).filter(v => typeof v === "string");
    return max ? Array.from({ length: max, }, (e, i) => i < vals.length ? vals[i] : "") : vals;
  }

  render() {
    const { position, current, title, storage, data, back, roll, pick } = this.props;
    var titleStyle = data ? { color: "blue", cursor: "default", } : {};
    var values = this.getVals(), len = values.length, range = len ? "(1-" + len + ")" : "";
    return position === current && <View style={styles.diceBar}>
      <Button style={{ ...styles.button, ...styles.die, }} disabled={len < 1}
        onPress={roll}>Roll<br/><Text style={styles.range}>{range}</Text></Button>
      <View style={styles.dice}>
        <Text onPress={!data ? null : () => { this.setState({ valuesDialog: true, }); }}
          style={{ ...styles.diceTitle, ...titleStyle, }}>{title}</Text>
        <DieButton label="Back" onPress={back} disabled={len < 1}/>
      </View>
      <View style={{ ...styles.diceBar, flex: 99999, }}><Text> </Text></View>
      {len ? values.map((tip, i) => <Die key={i + 1} value={i + 1} tip={tip} pick={pick} />)
         : <h3 style={{ color: "orange", }}>{"<"}-- Click "{title}" to setup
             the {title.toLowerCase()} list!</h3>}
      {!this.state.valuesDialog ? [] : <ValuesDialog values={this.state.values}
        onToggle={(index, val) => { this.mod(s => { s[index].active = val; }); }}
        onAdd={name => { this.mod(s => { s.splice(9999, 0, { name, active: true, }); }); }}
        onChange={(index, val) => { this.mod(s => { s[index].name = val; }); }}
        onRemove={index => { this.mod(s => { s.splice(index, 1); }); }}
        onClose={() => { this.setState({ valuesDialog: false, });
          storage.save({ key: data, data: this.state.values, }); }}/>}
    </View>;
  }
}

const DieButton = ({ label, onPress, disabled }) =>
  <Button style={styles.button} disabled={disabled} onPress={onPress}>{label}</Button>;
DieButton.propTypes = { label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired, disabled: PropTypes.bool, };

const Die = ({ value, tip, pick }) =>
  <Button style={{ ...styles.button, ...styles.die, }} accessibilityLabel={tip}
    onPress={() => pick(value)}>{value}</Button>;
Die.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tip: PropTypes.string, pick: PropTypes.func.isRequired, };

const styles = StyleSheet.create({
  diceBar: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7777cc',
    padding: 6,
  },
  button: {
    borderWidth: 5,
    borderRadius: 15,
    backgroundColor: "#eeeeee",
    fontSize: 18,
    fontWeight: 'bold',
    margin: 2,
    minHeight: 40,
  },
  die: {
    height: 70,
    width: 70,
  },
  range: {
    fontSize: 16,
  },
  dice: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7777cc',
    padding: 6,
    minWidth: 120,
  },
  diceTitle: {
    margin: 12,
    marginTop: 0,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#eeeeee',
  },
});

export { Questions, Question, Die, DieButton };
