import "./components/Button.scss";
import "./components/Table.scss";
import Button from "./components/Button";

function App() {
  return (
    <div>
      <Button onClick={() => console.log("Back")}> Back </Button>
      <div />
      <table>
        <tbody>
          <tr>
            <td>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
              cursus consequat sem in tempor. In ac gravida libero, at fringilla
              libero. Interdum et malesuada fames ac ante ipsum primis in
              faucibus. Integer lectus nisl, venenatis vel commodo eget,
              fringilla eu odio. Ut consequat odio et lectus pharetra maximus.
              Etiam ut imperdiet turpis. Maecenas eleifend dolor nec massa
              cursus, nec consectetur lacus dignissim. Fusce hendrerit, purus
              eget molestie dapibus, dui lectus laoreet mi, sed placerat tortor
              odio at augue. Nam tempor lorem vehicula erat congue, eget
              vestibulum nunc porttitor. Mauris rutrum neque diam, ut
              sollicitudin enim faucibus in. Phasellus tempus consequat rhoncus.
              Donec quis vestibulum turpis. Proin ac tellus lorem. In id enim ac
              eros faucibus posuere.
            </td>
          </tr>
          <tr>
            <td>
              Aenean sodales eu turpis a tristique. Interdum et malesuada fames
              ac ante ipsum primis in faucibus. Praesent eu fringilla ex.
              Aliquam ut bibendum mauris. Curabitur ornare ex velit, vitae
              varius est tincidunt et. Maecenas finibus, neque at varius
              tincidunt, tortor enim ornare mauris, at molestie libero enim a
              diam. Phasellus porttitor, ante sit amet molestie semper, odio mi
              iaculis ligula, auctor lacinia quam erat nec elit. Nam faucibus
              porttitor justo quis condimentum. Phasellus vestibulum massa id
              fringilla ultricies. Nulla facilisi. Nam tempus dolor orci.{" "}
            </td>
          </tr>
        </tbody>
      </table>
      <div />
      <Button onClick={() => console.log("Report")} type="report">
        Report an Issue
      </Button>
    </div>
  );
}

export default App;
