from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql.functions import FunctionElement


class least(FunctionElement):
    name = 'least'


@compiles(least)
def _least_default(element, compiler, **kw):
    return compiler.visit_function(element)


@compiles(least, 'postgresql')
def _least_case(element, compiler, **kw):
    arg1, arg2 = list(element.clauses)
    return 'CASE WHEN {0} > {1} THEN {1} ELSE {0} END'.format(compiler.process(arg1), compiler.process(arg2))
