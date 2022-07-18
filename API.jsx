let dataTM;

const Pagination =({items, pageSize, onPageChange}) => {
  const {Button} = ReactBootstrap;
  if (items.length <=1) return null;

  let num = Math.ceil(items.length / pageSize);
  
  /* let pages = [];
  for (let index = 0; index < num; index++) {
    pages.push(index+1);
  } */

  let pages = range(1, num);

  const list = pages.map(page => {
    return ( <Button className="page-item Button" key={page} onClick={onPageChange} >{page}</Button>);
  });

  return (
    <nav>
      <ul className="pagination container">{list}</ul>
    </nav> )
}
const range = (start, end) =>{
  let array2 = Array(end-start+1).fill(1).map((item, index) => start + index);
  console.log(array2);
  return array2;
}

const {useState, useEffect, useReducer} = React;

//////////////////////////////////////////////////////////////////
const useDataApi = (initialUrl, initialData) => {
  const[url, setUrl] = useState(initialUrl);
  const[state, dispatch] = useReducer(dataFetchReducer, 
    {isLoading: false, 
      isError: false, 
      data:initialData});

  useEffect(()=>{
    const fetchData = async () =>{
      dispatch({type: "FETCH_INIT"});
      try {
        const result = await axios(url);
        dataTM = result.data._embedded.events;
        //console.log(dataTM.data._embedded.events);
        console.log(dataTM);

        dispatch ({type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({type: "FETCH_FAILURE"})
      }
    }

    fetchData();
  }, [url]);

  return [state, setUrl]
}
//////////////////////////////////////////////////////////////////
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };

    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
      
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true
        };

    default:
      throw new Error();
  }
}
//////////////////////////////////////////////////////////////////


const App =()=>{
  let initialUrl = "https://app.ticketmaster.com/discovery/v2/events.json?marketId=402&apikey=fml2gi7NIOBmdwd914xBGjKrQBwKcvkg";
  const [url, setUrl] = useState(initialUrl);
  const [query, setQuery] = useState("402");
  //const [data, setData] = useState({ hits: []});
  const [{data, isLoading, isError}, doFetch ] = useDataApi(initialUrl, { _embedded: {events: []}});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, SetPageSize] = useState(7);

  let paginate = (page, currentPage, pageSize) =>{
    const start = (currentPage -1) * pageSize;
    let newPage = page.slice(start, start+pageSize);
    return newPage;
  }

  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };

/*   let dataX = [];
  for (let index = 0; index < 25; index++) {
    dataX.push({objectID: index, title: `Title ${index +1 }`, url: `Title ${index + 1}`});
  }
  let page = dataX; */
  let page = data._embedded.events;

  if (page.length >=1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`current page: ${currentPage}`)
  }
 
  return (
  <div>
    <div className="container city-selector">
      <form onSubmit={e => {
        console.log(query);
        doFetch(`https://app.ticketmaster.com/discovery/v2/events.json?marketId=${query}&apikey=fml2gi7NIOBmdwd914xBGjKrQBwKcvkg`);
        e.preventDefault();
      }}>
        <select id="mode-select" onChange={(e)=> setQuery(e.target.value)} name="mode" >
          <option value="402">Mexico City</option>
          <option id="deposit-selection" value="403">Monterrey</option>
          <option id="cashback-selection" value="404">Guadalajara</option>
        </select>
       {/*  <input type={"text"} value={query} onChange={(e) => setQuery(e.target.value)} ></input> */}
        <button type="submit">Search</button>
      </form>
    </div>

      {isError && <div>Something went wrong...</div>}

      {isLoading ? 
      ( <div>Loading...</div> ) : 
      (
        <div className="container">
          <ul className="list-group">
          {page.map(item => (
                <li key={item.id} className="list-group-item">
                  <h3><a href={item.url}>{item.name}</a></h3> 
                  <a href={item.url}><span>[{item.dates.start.localDate}][{item.dates.start.localTime}]</span></a>
                  
                  <div>{item.info}</div>
                  <img src={item.images[0].url} alt="image" width="500" ></img>
                </li>
              ))}
          </ul>
        </div>
      )}
      <Pagination
      items={data._embedded.events}
      /* items={dataX} */
      pageSize={pageSize}
      onPageChange={handlePageChange}
      ></Pagination>
  </div>)
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);