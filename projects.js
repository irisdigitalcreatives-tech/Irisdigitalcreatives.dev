let projectTrigger;
document.querySelectorAll('[data-project]').forEach(button => {
 button.addEventListener('click', () => {
  projectTrigger = button;
  document.getElementById('project-' + button.dataset.project).showModal();
  document.body.classList.add('project-modal-open');
 });
});
document.querySelectorAll('.project-dialog').forEach(dialog => {
 dialog.querySelector('.project-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => {
  const r = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
 });
 dialog.addEventListener('close', () => {
  document.body.classList.remove('project-modal-open');
  projectTrigger?.focus();
 });
});
