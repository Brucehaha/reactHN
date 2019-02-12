import React, { Component } from 'react';
import './App.css';
import uuid from "uuid";
import axios from "axios"

const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page='
// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;


class App extends Component{
  _isMounted = false;
  constructor(props){
    super(props);
    this.state={
      result:null,
      searchKey: '',
      searchTerm:DEFAULT_QUERY,
      error:null,
      isLoading:false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    const {searchTerm} = this.state;
    this.setState({searchKey:searchTerm});
    this.fetchSearchTopStories(searchTerm);

  }
  compoentWillUnmount(){
    this._isMounted = false;

  }
  setSearchTopStories = response => {
    const {hits, page} = response;
    const {searchKey,results}=this.state;
    const oldHits = (results&&results[searchKey])?results[searchKey].hits:[];

    const updatedHits = [...new Set([...oldHits, ...hits])]
    this.setState({
      results:{...results,
        [searchKey]:{hits:updatedHits, page},
      },
      isLoading:false

    })

  }

  fetchSearchTopStories = (searchTerm, page=0) => {
    this.setState({isLoading:true});
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
    .then(results=>this._isMounted&&this.setSearchTopStories(results.data))
    .catch(error=>this.setState({error}))
  }


  onSearchChange = (event) => {
    this.setState({searchTerm:event.target.value})
  }

  isLocalSearch = (searchTerm) => {
    return !this.state.results[searchTerm];
  }

  onSearchSubmit = (event) => {
    this.setState({searchTerm:event.target.value})
    const {searchTerm, results} = this.state;
    this.setState({searchKey:searchTerm});
    if(this.isLocalSearch){
      this.fetchSearchTopStories(searchTerm)
    }
    const {searchKey} = this.state;

    console.log(results)
    console.log(searchKey)

    event.preventDefault();

  }

  onDismiss = (id) => {
    const {searchKey, results}=this.state;
    const {hits, page}=results[searchKey];
    const isNotId=item=>item.objectID!==id;
    const updatedHits=hits.filter(isNotId);
    this.setState({
      results:{...results,
              [searchKey]:{hits: updatedHits, page}
            }
            });
  }


  render(){
      const {results, searchTerm, searchKey, error, isLoading} = this.state;
      const page=(results&&results[searchKey]&&results[searchKey].page)||0;
      const list=(results&&results[searchKey]&&results[searchKey].hits)||[];
      if (error) {
      return <p>Something went wrong.</p>;
    }

      return(
          <div className="page">
            <div className="interaction">
            <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
            </div>
            {results&&<Table list={list} page={page} onDismiss={this.onDismiss}/>
            }
          <div className="interaction">
            <ButtonWithLoading isLoading={isLoading} onClick={()=>this.fetchSearchTopStories(searchKey, page+1)}>
            More
          </ButtonWithLoading>
          </div>

          </div>
      );
  }
}

class Search extends Component{
  componentDidMount(){
    if(this.input){
        this.input.focus();
      }
    }

    render(){
        const {value, onChange, onSubmit, children} = this.props;
        return(
            <form onSubmit={onSubmit}>
                <input type="text" ref={(node)=>{this.input=node;}} value={value} onChange={onChange} />
                <button type='submit'>{children}</button>
            </form>

        );

    }
}
class Table extends Component{
    render(){
        const {list, onDismiss} = this.props;
        return (
            <div className="table">
            {list.map(item =>
                <div key={item.objectID+uuid.v4()} className="table-row">
                            <span style={{width:'40%'}}>
                            <a href={item.url}>{item.title}</a>
                            </span>
                    <span style={{width:'30%'}}>
                              {item.author}
                            </span>
                    <span style={{width:'10%'}}>
                              {item.num_comments}
                            </span>
                    <span style={{width:'10%'}}>
                              {item.points}
                            </span>
                    <span style={{width:'10%'}}>
                                <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>
                                    Dismiss
                                </Button>
                            </span>
                </div>
                )}
            </div>
         );

        }
    }


const Button = ({onClick, className='', children}) =>
  <button onClick={onClick} className={className} type="button">
  {children}
  </button>

const Loading =()=> <div>loading...</div>
const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading
    ?<Loading/>
    :<Component {...rest} />
const ButtonWithLoading = withLoading(Button)

export default App;
