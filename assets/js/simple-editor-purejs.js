//
// NOTE: If you choose to use this version of the javascript file
// you don't need jQuery.
//

var l = console.log.bind(console);

var simpleEditor = (function () {
  var textareas = [],
    editors = [],
    btnsB = [],
    btnsI = [],
    btnsU = [];

  var template =
    " \
        <div class='simpledit te-wrapper' style='background: white; width: 99%; border-radius: 12px;'> \
            <div class='text' contentEditable='true' spellcheck='false' style='height: 90%; outline: none; padding: 12px;'></div> \
            <div class='buttons' style='border-radius: 12px; padding: 5px 12px; border: 1px solid #F1F1F1;'> \
                <span class='hyb-nt-btn bold cursor-pointer' style='font-weight: bold;'>B</span> \
                <span class='hyb-nt-btn italic cursor-pointer' style='font-weight: lighter; font-style: italic; margin-left: 7px; margin-right: 7px;'>I</span> \
                <span class='hyb-nt-btn underline cursor-pointer' style='font-weight: lighter; text-decoration: underline;'>U</span> \
            </div> \
        </div> \
    ";

  /**
   * Remove formatting upon pasting text into the editable area.
   */
  function plainTextOnPaste() {
    editors.forEach(function (editor) {
      editor.querySelector(".text").addEventListener("paste", function () {
        var _self = this;
        setTimeout(function () {
          // Set textContent with the result of textContent, which effectively
          // removes any formatting (textContent is plain text, unlike innerHTML).
          _self.textContent = _self.textContent;
        }, 3);
      });
    });
  }

  /**
   * Apply bold and italic when ‘b’ and ‘i’ buttons are clicked.
   *
   * In some browsers, ^b and ^i shortcuts just work. Sadly, some browsers
   * already use those shortcuts for themselves (^b bookmarks, ^i page info).
   */
  function formatText() {
    // Prevent loosing text selection when clicking the buttons.
    //$(document).on('mousedown', '.simpledit .buttons i.bold, .simpledit .buttons i.italic, .simpledit .buttons i.underline', function (evt) {
    //    evt.preventDefault();
    //});

    btnsB.forEach(function (item) {
      item.addEventListener("mousedown", function (evt) {
        evt.preventDefault();
      });

      item.addEventListener(
        "click",
        function () {
          document.execCommand("bold");
        },
        false
      );
    });

    btnsI.forEach(function (item) {
      item.addEventListener("mousedown", function (evt) {
        evt.preventDefault();
      });

      item.addEventListener(
        "click",
        function () {
          document.execCommand("italic");
        },
        false
      );
    });

    btnsU.forEach(function (item) {
      item.addEventListener("mousedown", function (evt) {
        evt.preventDefault();
      });

      item.addEventListener(
        "click",
        function () {
          document.execCommand("underline");
        },
        false
      );
    });
  }

  function setup(opts) {
    textareas = [].slice.call(document.querySelectorAll(opts.selector));

    // Add rich editors in place of the original textareas.
    textareas.forEach(function (item) {
      item.style.display = "none";

      // We have to create a new object everytime otherwise
      // all editors are actually the same and that will give us problems.
      var tmpdiv = document.createElement("div");
      tmpdiv.innerHTML = template;
      editors.push(tmpdiv.firstElementChild);
      item.parentNode.insertBefore(tmpdiv.firstElementChild, item);

      // Every time we do editors.push(), we increase its length. We always want
      // to add the text in the current textarea to the last added editor.
      editors[editors.length - 1].querySelector(".text").innerHTML = item.value;
    });

    // Retrieve all buttons (b, i, u) from the available editors.
    editors.forEach(function (item) {
      btnsB.push(item.querySelector(".buttons span.bold"));
      btnsI.push(item.querySelector(".buttons span.italic"));
      btnsU.push(item.querySelector(".buttons span.underline"));
    });

    // Add listeners to btns.
    formatText();

    if (opts.pastePlain) {
      plainTextOnPaste();
    }
  }

  /**
   * Sends text from the editable content to their respective textareas.
   */
  function save() {
    editors.forEach(function (editor, index) {
      textareas[index].value = editor.querySelector(".text").innerHTML;
    });
  }

  function init(opts) {
    checkOpts(opts);

    setup(opts);
  }

  function checkOpts(opts) {
    opts.selector = opts.selector || "textarea";
    opts.pastePlain = opts.pastePlain || false;
  }

  return {
    init: init,
    save: save,
  };
})();
