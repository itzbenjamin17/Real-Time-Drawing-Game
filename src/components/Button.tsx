import "./Button.scss";

interface Props {
  children: string;
  colour?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  onClick: () => void;
  type?: "" | "report";
}

const Button = ({
  children,
  onClick,
  colour = "primary",
  type = "",
}: Props) => {
  return (
    <button className={"btn btn-bd-" + colour + " " + type} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
