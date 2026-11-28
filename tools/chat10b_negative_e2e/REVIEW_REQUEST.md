# Отдельное ревью перед заявлением о готовности

**КУДА: существующая локальная или облачная бригада Codex с подтверждённой ролью `critical_reviewer`, только после РУЧНОЙ передачи владельцем, не запускать автоматически.**

Проверить exact bytes и SHA-256 каждого файла внутри `tools/chat10b_negative_e2e/`; оценить тестовую независимость, умышленные stub-only gaps, защита от misleading PASS, результаты NEG01-NEG10, отрицательные инварианты R270/V120, отсутствие сетевых/external side effects. Убедиться, что `sourceRefsOnly` не импортируются и не называются runtime truth, `cloudCheckpointVerified:false`, `endToEndRuntimePass:false`; проверить что нет runtime integrations и скрытых hooks. Вернуть подлинный role+exact-HEAD/byte-SHA provenance и список блокирующих дефектов.

Не менять файлы, не создавать PR, не деплоить, не трогать SQL/D1/Worker, не объявлять `critical_reviewer PASS` без подлинного отдельного reviewer output. Код исправлений, если нужны, только после нового task authorization и обновлённого checkpoint. Это запрос ревью, не свидетельство его выполнения.
