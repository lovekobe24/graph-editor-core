abstract class Change {
    abstract execute(): void;
    abstract undo(): void;
}

export default Change;