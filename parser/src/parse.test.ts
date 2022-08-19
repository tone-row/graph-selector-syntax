import { parse } from "./parse";

describe("parse", () => {
  test("it returns nodes and edges", () => {
    const result = parse(`a\n  b`);
    expect(result).toHaveProperty("nodes");
    expect(result).toHaveProperty("edges");
  });

  test("nodes have line number", () => {
    const result = parse(`a\nb`);
    expect(result.nodes[0].label).toEqual("a");
    expect(result.nodes[1].label).toEqual("b");
  });

  test("nodes have line number", () => {
    const result = parse(`a\nb`);
    expect(result.nodes[0].lineNumber).toEqual(1);
    expect(result.nodes[1].lineNumber).toEqual(2);
  });

  test("nodes have unique IDs", () => {
    const result = parse(`a\na`);
    expect(result.nodes[0].id).toEqual("a1");
    expect(result.nodes[1].id).toEqual("a2");
  });

  test("allow custom ID", () => {
    const result = parse(`#x a\n  #y b`);
    expect(result.nodes[0].id).toEqual("x");
    expect(result.nodes[1].id).toEqual("y");
  });

  test("custom id not included in label", () => {
    const result = parse(`#x a`);
    expect(result.nodes[0].id).toEqual("x");
    expect(result.nodes[0].label).toEqual("a");
  });

  test("can read classes without id", () => {
    const result = parse(`.class1.class2 a`);
    expect(result.nodes[0].classes).toEqual(".class1.class2");
    expect(result.nodes[0].label).toEqual("a");
  });

  test("can read classes with id", () => {
    const result = parse(`#x.class1.class2 a`);
    expect(result.nodes[0].id).toEqual("x");
    expect(result.nodes[0].classes).toEqual(".class1.class2");
    expect(result.nodes[0].label).toEqual("a");
  });

  test("creates edge with indentation", () => {
    const result = parse(`a\n  b`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("b1");
    expect(result.edges.length).toEqual(1);
  });

  test("create edge with label", () => {
    const result = parse(`a\n  b: c`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("c1");
    expect(result.edges[0].label).toEqual("b");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse id, classes when edge label", () => {
    const result = parse(`a\n  b: #x.class1.class2 c`);
    const edge = result.edges[0];
    const node = result.nodes[1];
    expect(edge.source).toEqual("a1");
    expect(edge.target).toEqual("x");
    expect(edge.label).toEqual("b");
    expect(edge.id).toEqual("a1-x-1");
    expect(node.id).toEqual("x");
    expect(node.classes).toEqual(".class1.class2");
  });

  test("should preserve spaces in labels", () => {
    let result = parse(`#b a long label`);
    const node = result.nodes[0];
    expect(node.label).toEqual("a long label");

    result = parse(`another one`);
    const node2 = result.nodes[0];
    expect(node2.label).toEqual("another one");
  });

  test("should parse attributes w/o quotes", () => {
    const result = parse(`[d=e][f=a] c`);
    expect(result.nodes[0].d).toEqual("e");
    expect(result.nodes[0].f).toEqual("a");
  });

  test("can parse all node qualities", () => {
    expect(parse(`#long-id.class1.class2[d=e][f=a] c`).nodes[0]).toMatchInlineSnapshot(`
      Object {
        "classes": ".class1.class2",
        "d": "e",
        "f": "a",
        "id": "long-id",
        "label": "c",
        "lineNumber": 1,
      }
    `);
  });

  // pointers
  test("can parse pointer to label", () => {
    const result = parse(`a\n  (a)`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("a1");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse pointer to id", () => {
    const result = parse(`#b b\na\n  (#b)`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("b");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse pointer to class", () => {
    const result = parse(`.c c\na\n  (.c)`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("c1");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse pointer source to raw node", () => {
    const result = parse(`a\n(a)\n  c`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("c1");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse pointer source to id", () => {
    const result = parse(`a\n(a)\n  #myid c`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("myid");
    expect(result.edges.length).toEqual(1);
  });

  test("can parse pointer source to class", () => {
    const result = parse(`a\n.red some color\n(a)\n  (.red)`);
    expect(result.edges[0].source).toEqual("a1");
    expect(result.edges[0].target).toEqual("some color1");
    expect(result.edges.length).toEqual(1);
  });

  test("gets the right number of nodes", () => {
    const result = parse(`a
e
    (a) (e)`);
    expect(result.nodes.length).toEqual(2);
  });
});
