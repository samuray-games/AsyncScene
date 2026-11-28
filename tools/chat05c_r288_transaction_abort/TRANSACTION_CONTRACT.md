# R288: точный разрез statement ABORT и полного transaction ROLLBACK

**SOURCE GAP**: реальный исходник Chat04.0 R287 `r287_battle_person_binding_immutable.sql` использует `RAISE(ABORT, 'R287_BATTLE_PERSON_BINDING_IMMUTABLE')`. SQLite откатывает UPDATE, который запустил guard, но оставляет начатую внешнюю транзакцию открытой. R287 `test_delta_06` доказал, что после перехвата ошибки другая запись может быть закоммичена. R288 `test_01` повторил тот же путь на неизменённых исходных байтах, включая запись *до* и *после* отказа.

**V129 REAL ENTRYPOINT**: исходный `bridge.py:183-235`, метод `TerminalSeam.commit(request)`: `BEGIN IMMEDIATE`, две ветви exact replay/terminal, внутри `except BaseException` explicit `ROLLBACK`, только затем локальный test witness. Этот код не изменён. Он не допускает вложенного transaction. Но он не является внешним контроллером всех security-effective DML боевого создания/идентичности. Поэтому при произвольной отдельной транзакции вызывающего кода описанный R287 failure по-прежнему возможен.

**R288 TASK-OWNED FIX**: `transaction_handler.py`, `SecurityTransactionHandler.run(callback)` создаёт собственный `BEGIN IMMEDIATE`, отдаёт callback не сырой `Connection`, а restricted SQL capability. На каждом `execute`, `executemany` и отложенном `fetch` SQLite-ошибка навсегда помечает текущий scope POISONED. Провал проверки вне SQL должен быть сообщён через `scope.require(False, reason)`. Состояние POISONED нельзя сбросить через публичный контракт. Новые DML, `COMMIT`, `ROLLBACK`, `PRAGMA`, DDL и непосредственное управление транзакцией из callback запрещены. После callback, даже если исключения были перехвачены самим приложением, handler проверяет POISONED и делает настоящий `ROLLBACK` с проверкой состояния и повторным чтением. Только полностью чистый callback приводит к одному `COMMIT`.

**Граница гарантии**: это *предложение для будущего Python/server handler*, не production Worker JS/D1. Оно защищает только код, проходящий через scope, а не привилегированный код с другой сырой ссылкой на Connection, не прямой доступ к таблицам, не DROP/rebuild/restore, не обходы DELETE/REPLACE/`battle_id`, не другие соединения вне общего арбитра. `run` не соединяется и не внедряется в V129 `TerminalSeam.commit()` автоматически: V129 уже имеет свой атомарный entrypoint, в него запрещён вложенный `BEGIN`. Для будущей объединённой транзакции P03/P05 необходим один owner, авторитетная общая физическая DB-топология и явный точный adapter API. Нельзя молча сделать две независимые транзакции одной атомарной операцией.

**Witness**: у V129 лишь инжектируемый тестовый `TestWitness` и test-only HMAC issuer. Новый handler не выдаёт их за independently protected witness, не добавляет тестовой подписи в runtime и не разрешает внешнюю доставку до настоящего witness. Внешняя rollback/fork атака не закрыта.

**Проверка по реальным исходникам**: V129 original ZIP SHA256 `29c92ba922d92925a1efdda0e9b747b353e490a68bbf8e060f728e69cb75fa06` (52,558 bytes; 25/25 manifest files). R287 delta original ZIP SHA256 `3bbab702f7c65d40df47827e275a4482ab570cc2dc0dd743396255dcd14bd450` (219,214 bytes; original outer manifest and CRC); nested original R287 ZIP SHA256 `f07f1f60d0043cf33829af3cf5423b967a050af42672a90b834c3753dda57d19`. Внутри R287 `upstream/R285_ORIGINAL.zip` содержит *тот же* исходный V129 ZIP байт в байт. Ни один исходник SQL/Worker не модифицировался.

**ИСПОЛНИМЫЕ ТЕСТЫ**:
- `test_01` является ПОЗИТИВНЫМ воспроизведением НЕЗАКРЫТОГО исходного инварианта; успех теста НЕ означает безопасность исходного R287 SQL.
- `test_02..04`: на реальном R287 trigger отменяются *все* промежуточные DML после запретного изменения identity, независимо от того, перехватил ли callback `IntegrityError`.
- `test_05`: разрешённая операция делает настоящий COMMIT.
- `test_06..08`: перехваченный denial внешнего preflight, попытка COMMIT или schema DROP отравляют и откатывают scope.
- `test_09`: чужая/nested транзакция отвергается без передачи callback.
- `test_10`: исходный V129 FINAL exact replay не даёт второго receipt/settlement после пойманной атаки.
- `test_11..13`: второй connection, reopen и настоящая гонка с двумя SQLite connection проверяют отсутствие промежуточных DML после ROLLBACK.
- `test_14..16`: ленивые ошибки cursor.fetch, ошибки parameter generator и исключения callback не дают partial commit.
- `test_17`: неподконтрольный BEGIN отвергается до выполнения callback.
- Исходные неизменённые V129 author-tests `33/33 PASS` были отдельно повторно запущены для FINAL, CANCEL, replay, exactly-one settlement, rollback. Они остаются synthetic SQLite, не runtime.

**ПРЕЖНИЕ ЗАПРЕТЫ**: 0011 MAY BE DURABLY APPLIED UNKNOWN, никогда не переписывать; 0012 Chat05Б scope, не править; R287 Чат04.0 и его будущий R288 SQL scope, не править. Нет owner GO на shared Worker/migrations/main/production/PR/D1, нет подтверждённых Mac locks/dirty/publisher. Repo .codex role critical_reviewer зарегистрирована, но в данной среде нет доступного callable runner. `SECURITY_TRANSACTION_VERDICT=ISOLATED_CONTRACT_PASS_ONLY / PRODUCTION_NO_GO`.

**Следующий разрешённый реальный шаг**: один назначенный владельцем интегратор 03/04.0/05C после owner GO, единого write-claim и внешнего witness проверяет физический transaction handler внутри настоящего Worker, выполняет такую же caught-ABORT регрессию в native D1, включает все identity write paths и exact issuer/sidecar/occupancy, проводит независимый critical_reviewer; только после этих доказательств возможны P03-AUTH / P05-FINAL product gates. Выполненная isolated работа не прибавляет баллы сама по себе.
