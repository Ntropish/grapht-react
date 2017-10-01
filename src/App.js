import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import injectTapEventPlugin from 'react-tap-event-plugin';

import update from 'react-addons-update'

import {grey400} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import {List, ListItem} from 'material-ui/List';

import fetch from 'isomorphic-fetch';

import Paper from 'material-ui/Paper';

import './grapht.css'
 
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

function buildFetcher(uri) {
  let fetcher = function(graphQLParams) {
    return fetch(uri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }
  fetcher.uri = uri
  return fetcher
}

class App extends Component {
  constructor(props) {
    super(props);

    let queries = [
      {
        uri: 'Enter a graphQL URI here',
        value: 'Your query here',
        name: "Query 1"
      }
    ];
    this.state = {
      queries: queries,
      schemas: {},
      selectedQuery: 0,
      fetcher: buildFetcher(''),
      temporaryUri: queries[0].uri
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const selectedQuery = this.selectedQuery()
    const prevQuery = prevState.queries[prevState.selectedQuery]

    // fetcher will need to update if the uri changed
    if (selectedQuery.uri !== prevQuery.uri) {
      this.setState(prevState=>{
        return Object.assign({}, prevState, {
          fetcher: buildFetcher(selectedQuery.uri),
          temporaryUri: selectedQuery.uri
        })
      })
    }
    // editor value needs to be manually updated because graphiql wasn't built for this
    if (selectedQuery.value !== prevQuery.value) {
      this.graphiql.getQueryEditor().setValue(selectedQuery.value)
    }
  }
  count = 1 
  setQueryInEditor(i) {
    let query = this.state.queries[i]
    this.graphiql.getQueryEditor().setValue(query.value)
    
    this.setState(prevState=>{
      return Object.assign({}, prevState, {selectedQuery: i})
    })
  }
  updateQuery(data) {
    console.log(data)
    this.setState((prevState) => {
      var updatedQuery = this.selectedQuery()
      updatedQuery.value = data

      var newState = Object.assign({}, prevState)

      newState.queries[prevState.selectedQuery] = updatedQuery

      return newState
    })
  }
  addQuery() {
    let newQuery = {
      name: `Query ${++this.count}`,
      uri: this.selectedQuery().uri,
      value: this.selectedQuery().value
    };
    let newState = update(this.state, {
      queries: {
        $push: [newQuery]
      }
    });
    this.setState(newState)
  }
  removeQuery(i) {
    this.setState(function(prevState) {

      var queriesCopy = [...prevState.queries]
      queriesCopy.splice(i, 1)

      var newSelection = this.state.selectedQuery;
      if(i <= this.state.selectedQuery) {
        newSelection--
      } 
      if(this.state.selectedQuery === i) {
        newSelection = 0
      }
      if(queriesCopy.length === 0) {
        queriesCopy = [
          {
            uri: 'Enter a graphQL URI here',
            value: 'Your query here',
            name: "Query 1"
          }
        ]
      }

      return Object.assign({}, prevState, {
        queries: queriesCopy,
        selectedQuery: newSelection
      })
    })
  }
  selectedQuery() {
    var potentialQuery = this.state.queries[this.state.selectedQuery];
    return potentialQuery;
  }
  uriLoad(event) {
    let newUri = event.target.value
    if (newUri !== this.selectedQuery().uri) {
      this.setState(prevState=>{
        return update(
          prevState, 
          {queries: {[prevState.selectedQuery]: {uri: {$set: newUri}}}}
        )
      })
    }
  }
  uriChange(event) {
    let newUri = event.target.value
    this.setState(prevState=>{
      return update(
        prevState, 
        {temporaryUri:  {$set: newUri}}
      )
    })
  }
  render() {
    const iconButtonElement = (
      <IconButton touch={true}>
        <MoreVertIcon color={grey400} />
      </IconButton>
    );

    return (
      <MuiThemeProvider  muiTheme={getMuiTheme(darkBaseTheme)}>
        <div className="App">
          <Paper zDepth={3}>
            <nav>
              <FlatButton
                hoverColor="#8AA62F"
                style={{margin: 12}}
                onClick={()=>this.addQuery()}
              > New Query</FlatButton>
              <List>
                {this.state.queries.map((q, i)=>{
                  return <ListItem 
                  primaryText={q.name} 
                  key={i}
                  onClick={()=>this.setQueryInEditor(i)}
                  rightIconButton={
                      <IconMenu iconButtonElement={iconButtonElement}>
                        <MenuItem onClick={this.removeQuery.bind(this, i)}>Delete</MenuItem>
                      </IconMenu>
                    }>
                  </ListItem>
                  })
                }
              </List>
            </nav>
          </Paper>
          <div className="workspace">
            <div className="io">
              <GraphiQL 
              onEditQuery={this.updateQuery.bind(this)}
              editorTheme="grapht"
              ref={c=> this.graphiql = c}
              fetcher={this.state.fetcher}
              query={this.selectedQuery().value}>
                <GraphiQL.Logo>
                  &nbsp;
                </GraphiQL.Logo>
                <GraphiQL.Toolbar>
                  <TextField
                  style={{color: 'white'}}
                  id='uriInput'
                  label='uri'
                  value={this.state.temporaryUri}
                  onChange={this.uriChange.bind(this)}
                  onBlur={this.uriLoad.bind(this)}></TextField>
                </GraphiQL.Toolbar>
              </GraphiQL>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
      
    );
  }
}

export default App;
