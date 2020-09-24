import React, { useState, useEffect } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
} from "./graphql/subscriptions";

function App() {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [id, setId] = useState("");
  // const [state, setState] = useState({
  //   id: "",
  //   note: "",
  //   notes: [],
  // });

  useEffect(() => {
    getNotes();

    const owner = Auth.user.getUsername();

    const createNoteListener = API.graphql(
      graphqlOperation(onCreateNote, { owner })
    ).subscribe({
      next: (noteData) => {
        const newNote = noteData.value.data.onCreateNote;
        setNotes((prevNotes) => {
          const oldNotes = prevNotes.filter((note) => note.id !== newNote.id);
          const updatedNotes = [...oldNotes, newNote];
          return updatedNotes;
        });
        setNote("");
      },
    });

    const deleteNodeListener = API.graphql(
      graphqlOperation(onDeleteNote, { owner })
    ).subscribe({
      next: (noteData) => {
        const deletedNote = noteData.value.data.onDeleteNote;
        setNotes((prevNotes) => {
          return prevNotes.filter((note) => note.id !== deletedNote.id);
        });
      },
    });

    const updateNodeListener = API.graphql(
      graphqlOperation(onUpdateNote, { owner })
    ).subscribe({
      next: (noteData) => {
        const updatedNote = noteData.value.data.onUpdateNote;
        setNotes((prevNotes) => {
          const index = prevNotes.findIndex(
            (note) => note.id === updatedNote.id
          );
          const updatedNotes = [
            ...prevNotes.slice(0, index),
            updatedNote,
            ...prevNotes.slice(index + 1),
          ];
          return updatedNotes;
        });
        setNote("");
        setId("");
      },
    });

    return () => {
      createNoteListener.unsubscribe();
      deleteNodeListener.unsubscribe();
      updateNodeListener.unsubscribe();
    };
  }, []);

  const getUser = async () => {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  };

  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    const newNotes = result.data.listNotes.items;
    setNotes(newNotes);
    //setState({ ...state, notes: newNotes, note: "" });
    //console.log(state, "state");
  };

  //const { notes, note } = state;

  const handleChangeNote = (event) => {
    //console.log(state, "handle change note ");
    setNote(event.target.value);
    // setState({
    //   ...state,
    //   note: event.target.value,
    //   notes: notes,
    // });
  };

  const hasExistingNote = () => {
    //const { notes, id } = state;
    if (id) {
      const isNote = notes.findIndex((note) => note.id === id) > -1;
      return isNote;
    }
    return false;
  };

  const handleAddNote = async (event) => {
    //const { note, notes } = state;
    event.preventDefault();

    if (hasExistingNote()) {
      handleUpdateNotes();
      console.log("note updated!");
    } else {
      console.log("note created!");
      const input = {
        note,
      };
      await API.graphql(graphqlOperation(createNote, { input: input }));
      // const newNote = result.data.createNote;
      // const updatedNotes = [newNote, ...notes];
      //setState({ note: "" });
      setNote("");
    }
  };

  const handleDeleteNote = async (noteId) => {
    //const { notes } = state;
    const input = {
      id: noteId,
    };
    const deleted = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deleteItemId = deleted.data.deleteNote.id;
    const updatedNotes = notes.filter((note) => note.id !== deleteItemId);
    //setState({ notes: updatedNotes });
    setNotes(updatedNotes);
  };

  const handleUpdateNotes = async () => {
    //const { notes, id, note } = state;
    const input = {
      id,
      note,
    };
    const updated = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = updated.data.updateNote;
    const noteIndex = notes.findIndex((n) => n.id === updatedNote.id);
    if (noteIndex === -1) return;

    notes[noteIndex] = updatedNote;
    // setState({
    //   notes,
    //   note: "",
    //   id: null,
    // });
    setNote("");
    setId(null);
  };

  // const handleSetNote = (item) =>{
  //   console.log(item, 'item');
  // }
  const handleSetNote = ({ note, id }) => {
    console.log(note, id);
    // setState({ ...state, id, note });
    setNote(note);
    setId(id);
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
            {id ? "Update Note" : "Add Note"}
          </button>
        </form>
        <div>
          {notes &&
            notes.map((item) => (
              <div key={item.id} className="flex items-center">
                <li onClick={() => handleSetNote(item)} className="list pa1 f3">
                  {item.note}
                </li>
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
