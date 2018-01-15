import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { log, StyleSheet, Modal, View, Text, TextInput, Button, Switch } from './Env';

class ValuesDialog extends Component {
  constructor(props) {
    super(props);
    this.addName = this.addName.bind(this);
    this.state = { log, addName: "", };
  }

  static propTypes = {
    values: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired, active: PropTypes.bool, })).isRequired,
    visible: PropTypes.bool, onToggle: PropTypes.func.isRequired, onAdd: PropTypes.func,
    onChange: PropTypes.func, onRemove: PropTypes.func, onClose: PropTypes.func.isRequired,
  };

  addName(e) { this.props.onAdd(this.state.addName); e.target.select(); };
  modName(i, e, t) {
    if (t) { this.props.onChange(i, t); } else { this.props.onRemove(i); }
    e.target.blur();
  };

  render() {
    return (
      <Modal visible={this.props.visible} onRequestClose={this.props.onClose}>
        <View style={styles.valuesDialog} onPress={e => { e.preventDefault(); }}>
          <Text style={styles.valuesTitle}>Players</Text>
          <View style={styles.values}>
            {this.props.values.map((p, i) =>
              <View key={'P' + i + p.name.replace(/[^A-Za-z0-9]/, "-")} style={styles.value}>
                <Switch value={p.active} onValueChange={v => { this.props.onToggle(i, v); }}/>
                <ValueName name={p.name} onEdit={(e, t) => { this.modName(i, e, t); }}/>
              </View>)}
          </View>
          {!this.props.onAdd ? [] : <View style={styles.values}>
            <TextInput value={this.state.addName} style={{ ...styles.valueName, borderWidth: 1, }}
              onChangeText={t => { this.setState({ addName: t, }); }} selectTextOnFocus={true}
              onSubmitEditing={this.addName}/>
            <Button style={styles.button} onPress={this.addName}>Add</Button>
          </View>}
        </View>
      </Modal>
    );
  }
}

class ValueName extends Component {
  constructor(props) { super(props); this.state = { modName: props.name, }; }

  static propTypes = { name: PropTypes.string.isRequired, onEdit: PropTypes.func.isRequired, };

  render() {
    return (<TextInput style={styles.valueName} value={this.state.modName}
      onChangeText={t => { this.setState({ modName: t, }); }} selectTextOnFocus={true}
      onSubmitEditing={e => { this.props.onEdit(e, this.state.modName); }}/>);
  }
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 5,
    borderRadius: 15,
    backgroundColor: "#eeeeee",
    fontSize: 18,
    fontWeight: 'bold',
    margin: 2,
    minHeight: 40,
  },
  valuesDialog: {
    textAlign: "center",
  },
  valuesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  values: {
    marginTop: 12,
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    textAlign: "left",
    width: 140,
  },
  valueName: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 5,
    borderColor: "gray",
    borderWidth: 0,
    width: 80,
  },
});

export { ValuesDialog };
