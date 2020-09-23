import React from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
const state = {
  notes: [
    {
      id: 1,
      note: "Hello World",
    },
  ],
};
function App() {
  const { notes } =  state;
  return (
    <React.Fragment>
      <AmplifySignOut />
      <div className="flex flex-column items-center justify-content pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>

        <form className="mb3">
          <input
            className="pa2 f4"
            type="text"
            placeholder="Write your note"
          ></input>
          <button className="pa2 f4" type="submit">
            Add note
          </button>
        </form>
        <div>{notes.map(item=>(
          <div key={item.id} className="flex items-center">
            <li className="list pa1 f3">
              {item.note}
            </li>
            <button className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}</div>
      </div>
    </React.Fragment>
  );
}

export default withAuthenticator(App);
