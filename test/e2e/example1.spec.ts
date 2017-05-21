import {applyMiddleware, combineReducers, createStore, Dispatch, Store} from 'redux';
import {createRouter} from '../../lib/router';
import {navigateAction} from '../../lib/actions';
import {createRoute} from '../../lib/route';
import {transactionMiddleware, transactionReducer} from 'redux-tx';
import thunk from 'redux-thunk';



describe('example1', () => {
    it('a1', async () => {
        interface State {}
        let path1Route = createRoute<void, State>('one', '/one',
            async (args: void, dispatch: Dispatch<State>, getState: () => State) => {
                await dispatch(navigateAction(path2Route.href()));
            });
        let path2Route = createRoute<void, State>('two', '/two',
            async (args: void, dispatch: Dispatch<State>, getState: () => State) => {
                await dispatch(navigateAction(path3Route.href()));
            });
        let path3Route = createRoute<void, State>('three', '/three');
        let path4Route = createRoute<void, State>('four', '/four');
        let router = createRouter<State>([
                path1Route,
                path2Route,
                path3Route,
                path4Route
            ],
            '/four'
        );
        const store: Store<State> = createStore(
            transactionReducer<State>(
                combineReducers<State>({
                    routing: router.createReducer()
                })),
            applyMiddleware(
                transactionMiddleware,
                router.createMiddleware(),
                thunk)
        );

        await store.dispatch(navigateAction(path1Route.href()));
        console.log(store.getState());
    });
});
