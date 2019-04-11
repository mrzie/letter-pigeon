import * as React from 'react'
import { render } from 'react-dom'
import { useListener } from 'fugo'
import { fromEvent } from 'rxjs'
import MainView from './main';
import './index.less'
// import t,{a} from './test'

// const App = () => <div>
//     {/* <Demo />  */}
//     <MainView />
// </div>

const Demo = () => {
    useListener(() => {
        const scroll$ = fromEvent(document, 'scroll');

        return scroll$.subscribe(async (e: any) => console.log('blah',e));
    })

    React.useEffect(() => {
        // const ws = new WebSocket(`ws://${location.host}/ws`)
        const ws = new WebSocket(`ws://localhost:3000/ws`)

        return () => {
            ws.close()
        }
    })
    return null as null 
}

render(
    <MainView />,
    document.getElementById('app')
)