      $(function () {
        const includes = $('[data-include]')
        $.each(includes, function () {
          const file = $(this).data('include') + '.html';
          $(this).load(file);
        })
      })
