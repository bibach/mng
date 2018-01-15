import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { initApp, log, StyleSheet, Constants, View, Text } from './Env';
import { Questions, Question, DieButton } from './Questions';
// FIXME refs -> function-style; styles - PostCSS?; edit other lists?

class App extends Component {
  constructor(props) {
    super(props);
    this.genres = ["comedy", "science fiction", "fantasy", "drama", "suspense", "action", "documentary"];
    this.dramas = ["", "mystery", "crime", "disaster", "post-apocalypse", "war", "historical fiction", "western", "musical", "family"];
    this.suspenses = ["", "horror"];
    this.state = this.reset = { log, };
  }

  componentDidMount() { this.setState(this.reset = this.refs["q"].update({})); }

  static propTypes = { storage: PropTypes.object, };

  render() {
    const { player, type, modifier, subgenre, genre, cross, crosssubgenre, crossgenre } = this.state;
    return (<View style={styles.app}>
        <View style={styles.container}>
          <Text style={styles.paragraph}>
            For the next movie night, {player} will
            pick {type} {modifier} {subgenre} {genre} {cross} {crosssubgenre} {crossgenre}.
          </Text>
          <DieButton label="Reset" onPress={() => this.setState(this.reset)}/>
        </View>
        <Questions ref="q" storage={this.props.storage} answer={s => this.setState(s)} testAnswers={t => t(this.state)}>
          <Question title="Player" values={[]} data="players"/>
          <Question title="Type" values={["a classic", "a favorite", "a new", "any"]} placeholder="a _"/>
          <Question title="Genre" values={this.genres}/>
          <Question title="Sub-genre" values={this.dramas} active={s => s.genre === "drama"}/>
          <Question title="Sub-genre" values={this.suspenses} active={s => s.genre === "suspense"}/>
          <Question title="Modifier" values={["animated", "noir", "foreign", "combination"]} max={20}/>
          <Question title="Cross" values={[]} placeholder={s => s.modifier === "combination" ? "/" : null} active={s => false}/>
          <Question title="Genre" values={this.genres} name="crossgenre" active={s => s.modifier === "combination"}/>
          <Question title="Sub-genre" values={this.dramas} name="crosssubgenre" active={s => s.crossgenre === "drama"}/>
          <Question title="Sub-genre" values={this.suspenses} name="crosssubgenre" active={s => s.crossgenre === "suspense"}/>
        </Questions>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  app: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 6,
  },
  paragraph: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
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
});

initApp(App);
