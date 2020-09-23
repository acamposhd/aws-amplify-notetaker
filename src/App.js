import React, { useState, useEffect } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

function App() {
  const [state, setState] = useState({
    note: "",
    notes: [],
  });

  useEffect(() => {
    const getNotes = async () => {
      const { notes } = state;
      const result = await API.graphql(graphqlOperation(listNotes));
      const newNotes = result.data.listNotes.items;
      setState({ notes: newNotes, note: "" });
      console.log(state, "state");
    };
    getNotes();
  }, []);

  const { notes, note } = state;

  const handleChangeNote = (event) => {
    setState({
      note: event.target.value,
      notes: notes,
    });
  };

  const handleAddNote = async (event) => {
    const { note, notes } = state;
    event.preventDefault();
    const input = {
      note,
    };
    const result = await API.graphql(
      graphqlOperation(createNote, { input: input })
    );
    const newNote = result.data.createNote;
    const updatedNotes = [newNote, ...notes];
    setState({ notes: updatedNotes, note: "" });
  };

  const handleDeleteNote = async (noteId) => {
    const { notes } = state;
    const input = {
      id: noteId,
    };
    const deleted = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deleteItemId = deleted.data.deleteNote.id;
    const updatedNotes = notes.filter((note) => note.id !== deleteItemId);
    setState({ notes: updatedNotes });
  };

  return (
    <React.Fragment>
      <div className="dt w-100 border-box pa3 ph5-ns">
        <a className="dtc v-mid mid-gray link dim w-25" href="#" title="Home">
          <img
            src="http://tachyons.io/img/logo.jpg"
            className="dib w2 h2 br-100"
            alt="Site Name"
          />
        </a>
        <div className="dtc v-mid w-75 tr">
          <div
            className="link dim dark-gray f6 f5-ns dib mr3"
            href="#"
            title="About"
          >
            <AmplifySignOut />
          </div>
        </div>
      </div>

      <div className="flex flex-column items-center justify-content pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>

        <form className="mb3" onSubmit={handleAddNote}>
          <input
            className="pa2 f4"
            type="text"
            placeholder="Write your note"
            onChange={handleChangeNote}
            value={note}
          ></input>
          <button className="pa2 f4" type="submit">
            Add note
          </button>
        </form>
        <div>
          {notes &&
            notes.map((item) => (
              <div key={item.id} className="flex items-center">
                <li className="list pa1 f3">{item.note}</li>
                <button
                  onClick={() => handleDeleteNote(item.id)}
                  className="bg-transparent bn f4"
                >
                  <span>&times;</span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </React.Fragment>
  );
}

export default withAuthenticator(App);
